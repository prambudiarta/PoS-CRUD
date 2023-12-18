<template>
  <q-dialog v-model="dialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          {{ isEditMode ? 'Edit Booking' : 'Create Booking' }}
        </div>
      </q-card-section>

      <q-card-section>
        <!-- Form for booking data -->
        <q-select
          filled
          v-model="localBooking.lapangan"
          :options="lapanganOptions"
          label="Lapangan"
          emit-value
          map-options
        />
        <q-input v-model="localBooking.email" label="Email" />
        <q-input v-model="localBooking.phoneNumber" label="Nomor HP" />

        <div class="q-pa-md">
          <div class="q-pa-md">
            <q-badge color="primary" class="badge-large">Waktu Mulai</q-badge>
          </div>

          <div class="q-gutter-md row items-start">
            <q-date
              v-model="startDate"
              today-btn
              :navigation-min-year-month="minYearMonth"
            >
            </q-date>

            <q-time v-model="startTime" format24h :minute-options="timeOptions">
            </q-time>
          </div>
        </div>

        <div class="q-pa-md">
          <div class="q-pa-md">
            <q-badge color="primary" class="badge-large">Waktu Selesai</q-badge>
          </div>

          <div class="q-gutter-md row items-start">
            <q-date
              v-model="endDate"
              today-btn
              :navigation-min-year-month="minYearMonth"
            >
            </q-date>

            <q-time v-model="endTime" format24h :minute-options="timeOptions">
            </q-time>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="Save" color="primary" @click="saveBooking" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch, toRefs, onMounted } from 'vue';
import { useLiveData } from 'src/stores/live-data';
import Swal from 'sweetalert2';

export default {
  props: {
    booking: Object,
    isOpen: Boolean,
  },
  setup(props, { emit }) {
    const { isOpen } = toRefs(props);
    const dialog = ref(isOpen.value);
    const localBooking = ref({ ...props.booking });
    const isEditMode = computed(() => props.booking && props.booking.id);
    const liveDataStore = useLiveData();
    const lapanganOptions = ref([]);
    const timeOptions = [0, 30];

    const startDate = ref('');
    const endDate = ref('');
    const startTime = ref('');
    const endTime = ref('');

    watch(isOpen, (newValue) => {
      dialog.value = newValue;
    });

    watch(
      () => props.booking,
      (newBooking) => {
        localBooking.value = { ...newBooking };
      },
      { deep: true }
    );

    const fetchLapanganOptions = async () => {
      lapanganOptions.value = liveDataStore.lapangan.map((doc) => ({
        label: doc.nama, // Adjust if your field is named differently
        value: doc.nama,
      }));
    };

    const saveBooking = async () => {
      try {
        localBooking.value.startTime = new Date(
          `${startDate.value}T${startTime.value}`.replace(/\//g, '-')
        );
        localBooking.value.endTime = new Date(
          `${endDate.value}T${endTime.value}`.replace(/\//g, '-')
        );
        let result = '';

        if (isEditMode.value) {
          // Existing booking: update it
          result = await liveDataStore.updateBooking(localBooking.value);
        } else {
          // New booking: add it
          result = await liveDataStore.saveBooking(localBooking.value);
        }

        if (result === 'OK') {
          dialog.value = false;
          emit('save');
          Swal.fire('Success', result, 'success');
        } else {
          dialog.value = false;
          emit('save');
          Swal.fire('Warning', result, 'warning');
        }

        // Close the dialog and emit an event to refresh the bookings list
        emit('save');
      } catch (error) {
        console.error('Error saving booking:', error);
        // Handle the error, e.g., show a notification to the user
      }
    };

    const minYearMonth = computed(() => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
      return `${year}/${month}`;
    });

    onMounted(async () => {
      await liveDataStore.fetchLapangan();
      fetchLapanganOptions();
    });

    return {
      dialog,
      localBooking,
      isEditMode,
      lapanganOptions,
      startTime,
      endTime,
      startDate,
      endDate,
      timeOptions,
      minYearMonth,
      saveBooking,
    };
  },
};
</script>

<style scoped>
.badge-large {
  font-size: 1.2em; /* Adjust the font size as needed */
  padding: 0.5em 1em; /* Adjust padding for larger badge size */
}
</style>
