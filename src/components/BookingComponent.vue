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

        <!-- Start Date and Time Picker (native HTML5) -->
        <div class="q-mb-md">
          <label for="start-datetime">Start Date and Time:</label>
          <input
            type="datetime-local"
            id="start-datetime"
            v-model="localBooking.startTime"
            class="q-ml-sm"
          />
        </div>

        <!-- End Date and Time Picker (native HTML5) -->
        <div class="q-mb-md">
          <label for="end-datetime">End Date and Time:</label>
          <input
            type="datetime-local"
            id="end-datetime"
            v-model="localBooking.endTime"
            class="q-ml-sm"
          />
        </div>
        <!-- Add other fields as needed for booking -->
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

export default {
  props: {
    booking: Object,
    isOpen: Boolean,
  },
  setup(props) {
    const { isOpen } = toRefs(props);
    const dialog = ref(isOpen.value);
    const localBooking = ref({ ...props.booking });
    const isEditMode = computed(() => props.booking && props.booking.id);
    const liveDataStore = useLiveData();
    const lapanganOptions = ref([]);

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
        if (isEditMode.value) {
          // Existing booking: update it
          await liveDataStore.updateBooking(localBooking.value);
        } else {
          // New booking: add it
          await liveDataStore.saveBooking(localBooking.value);
        }

        // Close the dialog and emit an event to refresh the bookings list
        dialog.value = false;
        window.location.reload();
      } catch (error) {
        console.error('Error saving booking:', error);
        // Handle the error, e.g., show a notification to the user
      }
    };

    onMounted(async () => {
      await liveDataStore.fetchLapangan();
      fetchLapanganOptions();
    });

    return {
      dialog,
      localBooking,
      isEditMode,
      lapanganOptions,
      saveBooking,
    };
  },
};
</script>

<style>
/* ... your styles ... */

/* Ensure the dialog content can scroll if it's too tall for the viewport */
.q-dialog .q-card {
  overflow-y: auto;
}
</style>
