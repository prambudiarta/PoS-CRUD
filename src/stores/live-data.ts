import { E } from 'app/dist/pwa/assets/index.3d616b04';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { defineStore } from 'pinia';
import { db } from 'src/firebaseConfig';
import { minionUiSendMail } from 'src/minion/minion_send_email';
import { Booking, IBooking, IField, Lapangan } from 'src/types/interfaces';
import {
  generateUniqueCode,
  isCodeUnique,
} from 'src/utils/bookingCodeGenerator';
import calculateEndTime from 'src/utils/calculateEndTime';
import formatDateFirestore from 'src/utils/firebaseDateFormatter';

export const useLiveData = defineStore('liveData', {
  state: () => ({
    lapangan: [] as Lapangan[],
    bookings: [] as Booking[],
    fields: [] as IField[],
    newBooking: [] as IBooking[],
  }),
  getters: {},
  actions: {
    async loadFields() {
      const fieldsCollection = collection(db, 'lapangan');
      const fieldsSnapshot = await getDocs(query(fieldsCollection));

      const fieldsPromises = fieldsSnapshot.docs.map(async (doc) => {
        const fieldData = doc.data();

        // Fetch sports for this field
        const sportsCollection = collection(db, `lapangan/${doc.id}/Sports`);
        const sportsSnapshot = await getDocs(query(sportsCollection));

        const sportsPromises = sportsSnapshot.docs.map(async (sportDoc) => {
          const sportData = sportDoc.data();

          // Fetch packages for this sport
          const packagesCollection = collection(
            db,
            `lapangan/${doc.id}/Sports/${sportDoc.id}/Packages`
          );
          const packagesSnapshot = await getDocs(query(packagesCollection));

          const packages = packagesSnapshot.docs.map((packageDoc) => {
            const packageData = packageDoc.data();
            return {
              packageName: packageData.packageName,
              price: packageData.price,
              sku: packageData.sku,
              duration: packageData.duration,
              details: packageData.details,
            };
          });

          return {
            sportId: sportDoc.id,
            sportName: sportData.sportName,
            sportDescription: sportData.sportDescription,
            packages: await Promise.all(packages),
          };
        });

        return {
          fieldId: doc.id,
          fieldName: fieldData.fieldName,
          location: fieldData.location,
          sports: await Promise.all(sportsPromises),
        };
      });

      this.fields = await Promise.all(fieldsPromises);
    },
    async saveNewBooking(booking: IBooking) {
      console.log('startSaving');

      try {
        booking.endTime = calculateEndTime(
          booking.startTime,
          booking.package.duration
        );

        console.log(booking);

        const startTime = new Date(booking.startTime);
        const endTime = new Date(booking.endTime);
        const now = new Date();

        // Check 1: start datetime can't be in the past
        if (startTime < now) {
          return 'Start datetime cannot be in the past.';
        }

        // Check 2: end datetime must be greater than start datetime
        if (endTime <= startTime) {
          return 'End datetime must be greater than start datetime.';
        }

        let uniqueCode = '';
        let isUnique = false;

        while (!isUnique) {
          uniqueCode = generateUniqueCode();
          isUnique = await isCodeUnique(uniqueCode);
        }

        const bookingWithCode = {
          ...booking,
          code: uniqueCode,
        } as IBooking;

        const docName = `${booking.startTime}_${booking.endTime}_${booking.field.fieldId}_${uniqueCode}`;

        await setDoc(doc(db, 'newBooking', docName), bookingWithCode);

        return 'OK';
      } catch (error) {
        console.error(error);
        return 'An error occurred while saving the booking.';
      }
    },
    async deleteNewBooking(id: string) {
      try {
        await deleteDoc(doc(db, 'newBooking', id));
        return true;
      } catch (e) {
        return false;
      }
    },
    async updateNewBooking(booking: IBooking, id: string) {
      const saveNewBooking = await this.saveNewBooking(booking);

      if (saveNewBooking == 'OK') {
        await this.deleteNewBooking(id);
        return saveNewBooking;
      } else {
        return saveNewBooking;
      }
    },
    async fetchLapangan() {
      const lapanganSnapshot = await getDocs(collection(db, 'lapangan'));

      this.lapangan = lapanganSnapshot.docs.map((doc) => {
        const data = doc.data();
        // Ensure that the data conforms to the Item type
        const lapangan: Lapangan = {
          id: doc.id,
          nama: data.nama,
          olahraga: data.olahraga,
          deskripsi: data.deskripsi, // This field might be optional
        };
        console.log(this.lapangan);
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
    async fetchNewBookings() {
      const bookingsSnapshot = await getDocs(collection(db, 'newBooking'));
      this.newBooking = bookingsSnapshot.docs.map((doc) => {
        const data = doc.data();

        const booking: IBooking = {
          id: doc.id,
          sport: data.sport,
          code: data.code,
          endTime: data.endTime, // Convert Firestore Timestamp to JavaScript Date
          field: data.field,
          package: data.package,
          user: data.user,
          startTime: data.startTime, // Convert Firestore Timestamp to JavaScript Date
          playTime: data.playTime,
        };
        return booking;
      }); // Sort bookings by startTime, newest first
    },
    async fetchBookings() {
      const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
      this.bookings = bookingsSnapshot.docs
        .map((doc) => {
          const data = doc.data();

          const startTime =
            data.startTime instanceof Timestamp
              ? data.startTime.toDate()
              : new Date(data.startTime);
          const endTime =
            data.endTime instanceof Timestamp
              ? data.endTime.toDate()
              : new Date(data.endTime);

          const booking: Booking = {
            id: doc.id,
            code: data.code,
            olahraga: data.olahraga,
            harga: data.harga,
            email: data.email,
            endTime: endTime, // Convert Firestore Timestamp to JavaScript Date
            lapangan: data.lapangan,
            phoneNumber: data.phoneNumber,
            startTime: startTime, // Convert Firestore Timestamp to JavaScript Date
          };
          return booking;
        })
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime()); // Sort bookings by startTime, newest first
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

        // Retrieve the harga rate for the selected lapangan
        const lapanganData = this.lapangan.find(
          (l) => l.nama === newBooking.lapangan
        ); // Assuming lapangan ID is used
        if (!lapanganData) {
          return 'Lapangan data not found.';
        } // Implement this function to fetch lapangan data

        const hargaPerHour = lapanganData.olahraga[newBooking.olahraga];
        if (!hargaPerHour) {
          return 'Olahraga data not found.';
        }

        // Calculate the booking duration in  minutes
        const durationInMinutes =
          (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        const hoursCharged = Math.ceil(durationInMinutes / 60);

        // Calculate the total price
        const totalPrice = hargaPerHour * hoursCharged;

        // Generate a unique code
        let uniqueCode;
        let isUnique = false;

        while (!isUnique) {
          uniqueCode = generateUniqueCode();
          isUnique = await isCodeUnique(uniqueCode);
        }

        const bookingWithCode = {
          ...newBooking,
          code: uniqueCode,
          harga: totalPrice,
        } as Booking;

        await addDoc(collection(db, 'bookings'), bookingWithCode);

        this.sendEmail(bookingWithCode, false);

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

      // Retrieve the harga rate for the selected lapangan
      const lapanganData = this.lapangan.find(
        (l) => l.nama === updatedBooking.lapangan
      ); // Assuming lapangan ID is used

      if (!lapanganData) {
        return 'Lapangan data not found.';
      } // Implement this function to fetch lapangan data
      const hargaPerHour = lapanganData.olahraga[updatedBooking.olahraga];
      if (!hargaPerHour) {
        return 'Olahraga data not found.';
      }

      // Calculate the booking duration in minutes
      const durationInMinutes =
        (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      const hoursCharged = Math.ceil(durationInMinutes / 60);

      // Calculate the total price
      const totalPrice = hargaPerHour * hoursCharged;

      try {
        const bookingRef = doc(db, 'bookings', updatedBooking.id);

        const updateObject = {
          code: updatedBooking.code,
          email: updatedBooking.email,
          lapangan: updatedBooking.lapangan,
          harga: totalPrice,
          phoneNumber: updatedBooking.phoneNumber,
          olahraga: updatedBooking.olahraga,
          startTime: updatedBooking.startTime, // Convert Date to Firestore Timestamp
          endTime: updatedBooking.endTime,
        };

        await updateDoc(bookingRef, updateObject);

        this.sendEmail(updateObject as Booking, true);

        const index = this.bookings.findIndex(
          (booking) => booking.id === updatedBooking.id
        );

        if (index !== -1) {
          this.bookings.splice(index, 1, updatedBooking);
        }

        return 'OK';
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
    sendEmail(booking: Booking, isEdit: boolean) {
      let title = '';

      if (isEdit) {
        title = 'Konfirmasi Perubahan Jadwal';
      } else {
        title = 'Konfirmasi Pemesanan Lapangan';
      }

      const message = `
      <div style="font-family: 'Arial', sans-serif; background: #f4f4f4; padding: 10px; text-align: center;">
        <h2 style="color: #333;">${title}</h2>
      </div>
      <div style="margin: 20px;">
        <p style="margin-bottom: 10px;">Halo ${booking.phoneNumber},</p>
        <p style="margin-bottom: 10px;">Terima kasih telah melakukan pemesanan lapangan melalui sistem kami. Berikut adalah detail pemesanan Anda:</p>
        <p style="margin-bottom: 10px;"><strong>Kode Pemesanan:</strong> ${
          booking.code
        }</p>
        <p style="margin-bottom: 10px;"><strong>Nama Lapangan:</strong> ${
          booking.lapangan
        }</p>
        <p style="margin-bottom: 10px;"><strong>Olahraga:</strong> ${
          booking.olahraga
        }</p>
        <p style="margin-bottom: 10px;"><strong>Waktu Mulai:</strong> ${formatDateFirestore(
          booking.startTime
        )}</p>
        <p style="margin-bottom: 10px;"><strong>Waktu Selesai:</strong> ${formatDateFirestore(
          booking.endTime
        )}</p>
        <p style="margin-bottom: 10px;"><strong>Total Harga:</strong> Rp${
          booking.harga
        }</p>
        <p style="margin-bottom: 10px;">Harap simpan kode pemesanan ini untuk referensi Anda. Jika Anda memiliki pertanyaan atau perlu melakukan perubahan pada pemesanan Anda, silakan hubungi kami di [Nomor Kontak/Email].</p>
      </div>
      <div style="background: #f4f4f4; padding: 10px; text-align: center;">
        <p>Terima kasih telah memilih layanan kami. Kami berharap Anda memiliki pengalaman yang menyenangkan!</p>
        <p>Salam hangat,<br>Manajemen Cibabat Park</p>
      </div>
    `;

      minionUiSendMail(booking.code, booking.email, message);
    },
  },
});
