import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { defineStore } from 'pinia';
import { db } from 'src/firebaseConfig';
import { Booking, Lapangan } from 'src/types/interfaces';
import {
  generateUniqueCode,
  isCodeUnique,
} from 'src/utils/bookingCodeGenerator';

export const useLiveData = defineStore('liveData', {
  state: () => ({
    lapangan: [] as Lapangan[],
    bookings: [] as Booking[],
  }),
  getters: {},
  actions: {
    async fetchLapangan() {
      const lapanganSnapshot = await getDocs(collection(db, 'lapangan'));

      this.lapangan = lapanganSnapshot.docs.map((doc) => {
        const data = doc.data();
        // Ensure that the data conforms to the Item type
        const lapangan: Lapangan = {
          id: doc.id,
          nama: data.nama,
          harga: data.harga,
          deskripsi: data.deskripsi, // This field might be optional
        };
        return lapangan;
      });
    },
    async saveLapangan(lapangan: Lapangan) {
      await addDoc(collection(db, 'lapangan'), {
        ...lapangan,
      });

      this.lapangan.push({ ...lapangan });
    },
    async updateLapangan(updatedLapangan: Lapangan) {
      if (!updatedLapangan.id) {
        throw new Error('Lapangan must have an ID for updating');
      }

      const lapanganRef = doc(db, 'lapangan', updatedLapangan.id);

      const updateObject = {
        nama: updatedLapangan.nama,
        deskripsi: updatedLapangan.deskripsi,
        harga: updatedLapangan.harga,
      };

      await updateDoc(lapanganRef, updateObject);

      const index = this.lapangan.findIndex(
        (lapangan) => lapangan.id === updatedLapangan.id
      );

      if (index !== -1) {
        this.lapangan = [
          ...this.lapangan.slice(0, index),
          updatedLapangan,
          ...this.lapangan.slice(index + 1),
        ];
      }
    },
    async deleteLapangan(lapanganId: string | null) {
      if (lapanganId) {
        await deleteDoc(doc(db, 'lapangan', lapanganId));
        this.lapangan = this.lapangan.filter(
          (lapangan) => lapangan.id !== lapanganId
        );
      }
    },
    async fetchBookings() {
      const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
      this.bookings = bookingsSnapshot.docs.map((doc) => {
        const data = doc.data();
        const booking: Booking = {
          id: doc.id,
          code: data.code,
          email: data.email,
          endTime: data.endTime, // converting Timestamp to Date
          lapangan: data.lapangan,
          phoneNumber: data.phoneNumber,
          startTime: data.startTime, // converting Timestamp to Date
        };
        return booking;
      });
    },
    async saveBooking(newBooking: Omit<Booking, 'id' | 'code'>) {
      let uniqueCode;
      let isUnique = false;

      while (!isUnique) {
        uniqueCode = generateUniqueCode();
        isUnique = await isCodeUnique(uniqueCode);
      }

      const bookingWithCode = { ...newBooking, code: uniqueCode };
      await addDoc(collection(db, 'bookings'), bookingWithCode);
    },
    async updateBooking(updatedBooking: Booking) {
      if (!updatedBooking.id) {
        throw new Error('Booking must have an ID for updating');
      }

      const bookingRef = doc(db, 'bookings', updatedBooking.id);

      const updateObject = {
        code: updatedBooking.code,
        email: updatedBooking.email,
        lapangan: updatedBooking.lapangan,
        phoneNumber: updatedBooking.phoneNumber,
        startTime: Timestamp.fromDate(new Date(updatedBooking.startTime)), // assuming updatedBooking.startTime is a Date
        endTime: Timestamp.fromDate(new Date(updatedBooking.endTime)), // assuming updatedBooking.endTime is a Date // converting Timestamp to Date
        // ... other fields to update
        // Note: If you're updating startTime or endTime,
        // you may need to convert them to Firestore Timestamps
      };

      await updateDoc(bookingRef, updateObject);

      const index = this.bookings.findIndex(
        (booking) => booking.id === updatedBooking.id
      );

      if (index !== -1) {
        this.bookings.splice(index, 1, updatedBooking);
      }
    },
    async deleteBooking(bookingId: string | null) {
      if (bookingId) {
        await deleteDoc(doc(db, 'bookings', bookingId));
        this.bookings = this.bookings.filter(
          (booking) => booking.id !== bookingId
        );
      }
    },
  },
});
