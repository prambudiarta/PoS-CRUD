import { defineStore } from 'pinia';
import { db } from 'src/firebaseConfig';
import {
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { Item, ItemDetail, Order, OrderStatus } from 'src/types/interfaces';

export const useClientOrderStore = defineStore('clientOrderStore', {
  state: () => ({
    order: null as Order | null,
    items: [] as Item[],
  }),
  getters: {
    getOrder(state) {
      return state.order;
    },
    itemSummary(state) {
      return state.order?.itemSummary;
    },
    orderId(state) {
      return state.order?.orderId;
    },
    startTime(state) {
      return state.order?.startTime;
    },
  },
  actions: {
    async fetchItems() {
      const querySnapshot = await getDocs(collection(db, 'items'));
      this.items = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const item: Item = {
          id: doc.id,
          name: data.name,
          price: data.price,
          category: data.category,
          imageUrl: data.imageUrl,
        };
        return item;
      });
    },
    async closeOrder() {
      if (!this.order) {
        throw new Error('Order not found');
      }

      const orderRef = doc(db, 'order', this.order.orderId);

      await updateDoc(orderRef, {
        status: OrderStatus.CloseRequest,
      });
    },
    async fetchOrder(deviceId: string) {
      const querySnapshot = await getDocs(collection(db, 'order'));
      const orderDoc = querySnapshot.docs.find(
        (doc) =>
          doc.data().deviceId === deviceId &&
          doc.data().status !== OrderStatus.Completed
      );

      if (orderDoc) {
        this.order = orderDoc.data() as Order;
        this.order.orderId = orderDoc.id;
      } else {
        this.order = null;
      }
    },
    async addItemToOrder(itemDetail: ItemDetail[]) {
      if (!this.order) {
        throw new Error('Order not found');
      }

      const orderRef = doc(db, 'order', this.order.orderId);

      let totalItems = this.order.itemSummary?.totalItems || 0;
      let totalPrices = this.order.itemSummary?.totalPrices || 0;

      itemDetail.forEach((detail) => {
        totalItems += Number(detail.quantity);
        totalPrices += detail.price;
      });

      const items = this.order.itemSummary?.items || [];
      items.push(...itemDetail);

      const itemSummary = {
        totalItems: totalItems,
        totalPrices: totalPrices,
        items: items,
      };

      await updateDoc(orderRef, {
        itemSummary: itemSummary,
      });

      this.order.itemSummary = itemSummary;
    },
  },
});
