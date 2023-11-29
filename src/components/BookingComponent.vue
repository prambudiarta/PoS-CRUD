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
        <q-input v-model="localBooking.code" label="Booking Code" />
        <q-input v-model="localBooking.lapangan" label="Lapangan" />

        <!-- Start Time Datepicker -->
        <q-input filled v-model="localBooking.startTime" label="Start Time">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                ref="qStartDateTimeProxy"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="localBooking.startTime"
                  :min="minDate"
                  :max="maxDate"
                  @input="
                    () => {
                      $refs.qStartDateTimeProxy.hide();
                    }
                  "
                >
                  <div class="row items-center justify-end">
                    <q-time
                      v-model="localBooking.startTime"
                      format24h
                      @input="
                        () => {
                          $refs.qStartDateTimeProxy.hide();
                        }
                      "
                    />
                    <q-btn flat label="Close" color="primary" v-close-popup />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <!-- End Time Datepicker -->
        <q-input filled v-model="localBooking.endTime" label="End Time">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                ref="qEndDateTimeProxy"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="localBooking.endTime"
                  :min="minDate"
                  :max="maxDate"
                  @input="
                    () => {
                      $refs.qEndDateTimeProxy.hide();
                    }
                  "
                >
                  <div class="row items-center justify-end">
                    <q-time
                      v-model="localBooking.endTime"
                      format24h
                      @input="
                        () => {
                          $refs.qEndDateTimeProxy.hide();
                        }
                      "
                    />
                    <q-btn flat label="Close" color="primary" v-close-popup />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
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
import { ref, computed, watch, toRefs } from 'vue';
import { useLiveData } from 'src/stores/live-data';

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

    const minDate = new Date(); // or any other logic to set the minimum date
    const maxDate = new Date(
      new Date().setFullYear(new Date().getFullYear() + 1)
    ); // or any other logic to set the maximum date

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
        emit('update:isOpen', false);
        emit('saved');
      } catch (error) {
        console.error('Error saving booking:', error);
        // Handle the error, e.g., show a notification to the user
      }
    };

    return {
      dialog,
      localBooking,
      isEditMode,
      minDate,
      maxDate,
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
