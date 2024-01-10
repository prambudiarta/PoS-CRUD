// src/stores/itemStore.js

import { defineStore } from 'pinia';
import { db } from 'src/firebaseConfig';
import { collection, getDocs, query, setDoc, where } from 'firebase/firestore';
import {
  Item,
  ItemDetail,
  Order,
  OrderStatus,
  Printer,
  Room,
} from 'src/types/interfaces';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import {
  generateUniqueCode,
  isCodeKaraokeUnique,
} from 'src/utils/bookingCodeGenerator';

export const useOrderStore = defineStore('orderStore', {
  state: () => ({
    orders: [] as Order[],
    items: [] as Item[],
  }),
  getters: {
    // Define any getters here
  },
  actions: {
    async fetchItems() {
      const querySnapshot = await getDocs(collection(db, 'items'));
      this.items = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Ensure that the data conforms to the Item type
        const item: Item = {
          id: doc.id,
          name: data.name,
          price: data.price,
          category: data.category,
          imageUrl: data.imageUrl, // This field might be optional
        };
        return item;
      });
    },
    async fetchOrders() {
      const querySnapshot = await getDocs(collection(db, 'order'));
      this.orders = querySnapshot.docs
        .map((doc) => {
          const order: Order = doc.data() as Order;

          if (order.itemSummary && !Array.isArray(order.itemSummary.items)) {
            order.itemSummary.items = [order.itemSummary.items];
          }

          return order;
        })
        .sort((a, b) => b.startTime - a.startTime); // Sorting in descending order
    },
    async closeOrder(order: Order) {
      const orderRef = doc(db, 'order', order.orderId);
      const roomRef = doc(db, 'rooms', order.deviceId);

      await updateDoc(roomRef, {
        isAvailable: true,
      });

      // 1. Set endTime to the current time (epoch time)
      const endTime = Math.floor(new Date().getTime() / 1000); // Current time in milliseconds

      // 2. Calculate durationHours
      const durationHours = Math.ceil((endTime - order.startTime) / (60 * 60)); // Convert milliseconds to hours

      // 3. Calculate roomTotalPrice
      const roomTotalPrice = durationHours * order.roomRate;

      // 4. Calculate grandTotalPrice
      // Assuming itemsTotalPrice is stored in itemSummary
      let grandTotalPrice = 0;

      if (order.itemSummary) {
        grandTotalPrice = order.itemSummary.totalPrices + roomTotalPrice;
      } else {
        grandTotalPrice = roomTotalPrice;
      }

      // 5. Update the order document
      await updateDoc(orderRef, {
        status: OrderStatus.Completed,
        endTime: endTime, // Firestore server timestamp
        durationHours,
        roomTotalPrice,
        grandTotalPrice,
      });
    },
    async createNeworder(room: Room) {
      let uniqueCode = '';
      let isUnique = false;

      while (!isUnique) {
        uniqueCode = generateUniqueCode();
        isUnique = await isCodeKaraokeUnique(uniqueCode);
      }

      const startTime = Math.floor(new Date().getTime() / 1000);

      const newOrder: Order = {
        orderId: uniqueCode,
        deviceId: room.id,
        roomRate: room.price,
        startTime: startTime,
        status: OrderStatus.Pending,
      };

      if (!room.id) {
        throw new Error('Room ID is not set');
      }

      room.isAvailable = false;

      const roomRef = doc(db, 'rooms', room.id);
      await setDoc(roomRef, { ...room });

      const orderRef = doc(db, 'order', uniqueCode);
      await setDoc(orderRef, { ...newOrder });
    },
    async updateOrderItem(orderId: string, itemDetail: ItemDetail[]) {
      const orderRef = doc(db, 'order', orderId);

      let totalItem = 0;
      let totalPrices = 0;

      itemDetail.forEach((itemDetail) => {
        totalItem += Number(itemDetail.quantity);
        totalPrices += itemDetail.price;
      });

      const itemSummary = {
        totalItem: totalItem,
        totalPrices: totalPrices,
        items: itemDetail,
      };

      await updateDoc(orderRef, {
        itemSummary: itemSummary,
      });
    },
    async checkOrderForRoom(deviceId: string) {
      const ordersQuery = query(
        collection(db, 'order'),
        where('deviceId', '==', deviceId),
        where('status', '==', 'pending')
      );

      try {
        const querySnapshot = await getDocs(ordersQuery);
        const orders = querySnapshot.docs.map((doc) => {
          const order: Order = doc.data() as Order;

          if (order.itemSummary && !Array.isArray(order.itemSummary.items)) {
            order.itemSummary.items = [order.itemSummary.items];
          }

          return order;
        });

        // Check if there's any active order
        if (orders.length > 0) {
          // Assuming you want the latest order if there are multiple
          const latestOrder = orders[0];
          return latestOrder;
        } else {
          return null; // No active orders found
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        throw error; // Rethrow or handle error as needed
      }
    },
  },
});
