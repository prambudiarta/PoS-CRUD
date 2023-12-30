// src/stores/itemStore.js

import { defineStore } from 'pinia';
import { db } from 'src/firebaseConfig';
import { collection, getDocs, setDoc } from 'firebase/firestore';
import { Printer, Room } from 'src/types/interfaces';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';

export const useDeviceStore = defineStore('deviceStore', {
  state: () => ({
    rooms: [] as Room[],
    printers: [] as Printer[],
  }),
  getters: {
    // Define any getters here
  },
  actions: {
    async fetchRoom() {
      const querySnapshot = await getDocs(collection(db, 'rooms'));
      this.rooms = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Ensure that the data conforms to the Item type
        const room: Room = {
          id: doc.id,
          description: data.description,
          price: data.price,
          isAvailable: data.isAvailable,
        };
        return room;
      });
    },
    async saveRoom(room: Room) {
      if (!room.id) {
        throw new Error('Room ID is not set');
      }

      const roomRef = doc(db, 'rooms', room.id);
      await setDoc(roomRef, { ...room });

      this.rooms.push({ ...room });
    },
    async deleteRoom(roomId: string) {
      await deleteDoc(doc(db, 'room', roomId));
      // Optionally, you could also remove the item from the local 'items' array
      this.rooms = this.rooms.filter((room) => room.id !== roomId);
    },
    async updateRoom(updatedRoom: Room) {
      if (!updatedRoom.id) {
        throw new Error('Room must have an ID for updating');
      }

      const categoryRef = doc(db, 'room', updatedRoom.id);

      const updateObject = {
        id: updatedRoom.id,
        description: updatedRoom.description,
        price: updatedRoom.price,
        isAvailable: updatedRoom.isAvailable,
      };

      await updateDoc(categoryRef, updateObject);

      // Optionally, update the item in the local 'items' array
      const index = this.rooms.findIndex((item) => item.id === updatedRoom.id);
      if (index !== -1) {
        this.rooms[index] = updatedRoom;
      }
    },
    async fetchPrinter() {
      const querySnapshot = await getDocs(collection(db, 'printer'));
      this.printers = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Ensure that the data conforms to the Item type
        const printer: Printer = {
          id: doc.id,
          description: data.description,
        };
        return printer;
      });
    },
    async savePrinter(printer: Printer) {
      if (!printer.id) {
        throw new Error('Printer ID is not set');
      }

      const printerRef = doc(db, 'printer', printer.id);
      await setDoc(printerRef, { ...printer });

      this.printers.push({ ...printer });
    },
    async deletePrinter(printerId: string) {
      await deleteDoc(doc(db, 'printer', printerId));
      // Optionally, you could also remove the item from the local 'items' array
      this.printers = this.printers.filter(
        (printer) => printer.id !== printerId
      );
    },
    async updatePrinter(updatedPrinter: Printer) {
      if (!updatedPrinter.id) {
        throw new Error('Printer must have an ID for updating');
      }

      const categoryRef = doc(db, 'room', updatedPrinter.id);

      const updateObject = {
        id: updatedPrinter.id,
        description: updatedPrinter.description,
      };

      await updateDoc(categoryRef, updateObject);

      // Optionally, update the item in the local 'items' array
      const index = this.printers.findIndex(
        (item) => item.id === updatedPrinter.id
      );
      if (index !== -1) {
        this.printers[index] = updatedPrinter;
      }
    },
  },
});
