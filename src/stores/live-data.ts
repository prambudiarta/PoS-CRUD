import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
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
    async saveBooking(
      newBooking: Omit<Booking, 'id' | 'code'>
    ): Promise<string> {
      // Convert the start and end times to Date objects if they are not already
      const startTime = new Date(newBooking.startTime);
      const endTime = new Date(newBooking.endTime);
      const now = new Date();

      // Check 1: start datetime can't be in the past
      if (startTime < now) {
        return 'Start datetime cannot be in the past.';
      }

      // Check 2: end datetime must be greater than start datetime
      if (endTime <= startTime) {
        return 'End datetime must be greater than start datetime.';
      }

      try {
        // Check if the time slot is available
        const available = await this.isTimeSlotAvailable(
          newBooking.lapangan,
          newBooking.startTime,
          newBooking.endTime
        );

        if (!available) {
          return 'This time slot is already booked for the selected lapangan.';
        }

        // Generate a unique code
        let uniqueCode;
        let isUnique = false;

        while (!isUnique) {
          uniqueCode = generateUniqueCode();
          isUnique = await isCodeUnique(uniqueCode);
        }

        const bookingWithCode = { ...newBooking, code: uniqueCode };
        await addDoc(collection(db, 'bookings'), bookingWithCode);

        return 'OK';
      } catch (error) {
        console.error(error);
        return 'An error occurred while saving the booking.';
      }
    },
    async updateBooking(updatedBooking: Booking): Promise<string> {
      if (!updatedBooking.id) {
        return 'Booking must have an ID for updating.';
      }

      // Convert the start and end times to Date objects if they are not already
      const startTime = new Date(updatedBooking.startTime);
      const endTime = new Date(updatedBooking.endTime);
      const now = new Date();

      // Check 1: start datetime can't be in the past
      if (startTime < now) {
        return 'Start datetime cannot be in the past.';
      }

      // Check 2: end datetime must be greater than start datetime
      if (endTime <= startTime) {
        return 'End datetime must be greater than start datetime.';
      }

      // Check if the time slot is available
      const available = await this.isTimeSlotAvailable(
        updatedBooking.lapangan,
        startTime,
        endTime
      );

      if (!available) {
        return 'This time slot is already booked for the selected lapangan.';
      }

      try {
        const bookingRef = doc(db, 'bookings', updatedBooking.id);

        const updateObject = {
          code: updatedBooking.code,
          email: updatedBooking.email,
          lapangan: updatedBooking.lapangan,
          phoneNumber: updatedBooking.phoneNumber,
          startTime: Timestamp.fromDate(startTime), // Convert Date to Firestore Timestamp
          endTime: Timestamp.fromDate(endTime),
        };

        await updateDoc(bookingRef, updateObject);

        const index = this.bookings.findIndex(
          (booking) => booking.id === updatedBooking.id
        );

        if (index !== -1) {
          this.bookings.splice(index, 1, updatedBooking);
        }

        return 'Booking updated successfully.';
      } catch (error) {
        console.error('Error updating booking:', error);
        return 'An error occurred while updating the booking.';
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
    async isTimeSlotAvailable(
      lapanganId: string,
      newStartTime: Date,
      newEndTime: Date
    ) {
      const bookingsRef = collection(db, 'bookings');
      // Query for bookings that have an endTime greater than the newStartTime
      const bookingsQuery = query(
        bookingsRef,
        where('lapangan', '==', lapanganId),
        where('endTime', '>', newStartTime)
      );

      const querySnapshot = await getDocs(bookingsQuery);
      // Filter the results manually to find any that have a startTime less than the newEndTime
      const overlaps = querySnapshot.docs.some((doc) => {
        const booking = doc.data();
        return booking.startTime < newEndTime;
      });

      return !overlaps;
    },
  },
});
