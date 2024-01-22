<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Court Reservation</div>
      </q-card-section>

      <q-card-section class="flex flex-center q-gutter-md">
        <div class="q-pa-md" style="max-width: 300px">
          <div v-if="isEdit">Waktu Sebelumnya : {{ prevDate }}</div>
          <q-input filled v-model="dateTime">
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="selectedDate"
                    mask="YYYY/MM/DD"
                    :options="optionsFn"
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>

            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-time
                    v-model="selectedTime"
                    mask="HH:mm"
                    format24h
                    :minute-options="availableMinuteOptions"
                    :hour-options="availableHourOptions"
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </q-card-section>

      <q-card-section v-if="canReccuring && !isEdit">
        <q-select
          v-model="recurrence"
          :options="recurrenceOptions"
          label="Recurrence"
          emit-value
          map-options
        />
      </q-card-section>

      <q-card-section align="right">
        <div v-if="!isEdit">
          <q-btn label="Save" color="primary" @click="saveEvent" />
        </div>
        <div v-else>
          <q-btn
            label="Delete"
            color="red"
            @click="deleteEvent"
            style="margin-right: 15px"
          />
          <q-btn label="Update" color="primary" @click="updateEvent" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
import { useUserStore } from 'src/stores/user-store';
import { computed, defineComponent, onMounted } from 'vue';
import { IBooking } from 'src/types/interfaces';

import { ref, reactive } from 'vue';
import { useLiveData } from 'src/stores/live-data';
import Swal from 'sweetalert2';

export default defineComponent({
  props: {
    pilihTanggalData: Object,
  },
  setup(props) {
    const userStore = useUserStore();
    const liveData = useLiveData();

    const choosenData = ref({ ...props.pilihTanggalData });
    const timeOptions = [0, 30];
    const hourOption = [
      8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
    ];

    const dataBooking = computed(() => liveData.newBooking);

    const isEdit = computed(() => choosenData.value.isEdit);
    const prevDate = computed(() => choosenData.value.startTime);

    const selectedDate = ref(
      new Date().toISOString().split('T')[0].replace(/-/g, '/')
    ); // Holds the date
    const selectedTime = ref('08:00'); // Default start time

    const dateTime = computed({
      get: () => {
        return `${selectedDate.value} ${selectedTime.value}`;
      },
      set: (newValue) => {
        const parts = newValue.split(' ');
        selectedDate.value = parts[0]; // Update the date part
        selectedTime.value = parts[1]; // Update the time part
      },
    });

    const getBookingsForFieldAndDate = computed(() => {
      const selectedFieldId = choosenData.value.field.value.fieldId;

      // Extract only the date part from selectedDate
      const selectedDateOnly = selectedDate.value;

      console.log(selectedDateOnly);

      return dataBooking.value.filter((booking) => {
        const bookingFieldId = booking.field.fieldId;

        // Extract and format the date part from booking.startTime
        const bookingDate = booking.startTime.split(' ')[0].replace(/-/g, '/');

        return (
          bookingFieldId === selectedFieldId && bookingDate === selectedDateOnly
        );
      });
    });

    function generateTimeSlots() {
      const slots = [];
      for (let hour = 8; hour <= 22; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
      return slots;
    }

    function adjustBookedSlots(bookedSlots) {
      const adjustedSlots = new Set(bookedSlots);

      bookedSlots.forEach((slot) => {
        const [hour, minutes] = slot.split(':').map(Number);
        if (minutes === 0) {
          // If a slot like '15:00' is booked, also mark '15:30' as unavailable
          adjustedSlots.add(`${hour.toString().padStart(2, '0')}:30`);
        } else {
          // If a slot like '15:30' is booked, also mark '16:00' as unavailable
          const nextHour = hour + 1;
          adjustedSlots.add(`${nextHour.toString().padStart(2, '0')}:00`);
        }
      });

      return Array.from(adjustedSlots);
    }

    const timeOptionsFn = computed(() => {
      const bookedSlots = getBookingsForFieldAndDate.value.map((booking) =>
        booking.startTime.split(' ')[1].substring(0, 5)
      );

      console.log(getBookingsForFieldAndDate.value);
      console.log(bookedSlots);
      const adjustedBookedSlots = adjustBookedSlots(bookedSlots);
      const allSlots = generateTimeSlots();

      return allSlots.filter((slot) => !adjustedBookedSlots.includes(slot));
    });

    const availableTimeSlots = computed(() => {
      // Assuming timeOptionsFn returns an array like ["08:00", "08:30", ..., "22:00"]
      const slots = timeOptionsFn.value;
      return slots.map((slot) => {
        const [hour, minute] = slot.split(':');
        return { hour: parseInt(hour), minute: parseInt(minute) };
      });
    });

    const availableHourOptions = computed(() => {
      // Get unique hours from the available time slots
      const hours = new Set(availableTimeSlots.value.map((slot) => slot.hour));
      console.log(Array.from(hours));
      return Array.from(hours);
    });

    const availableMinuteOptions = computed(() => {
      // Get minutes for the selected hour
      // const selectedHour = new Date(date.value).getHours();
      // const minutes = availableTimeSlots.value
      //   .filter((slot) => slot.hour === selectedHour)
      //   .map((slot) => slot.minute);
      return [0, 30]; // Default minutes if no specific slots are available
    });

    const canReccuring = computed(() => {
      const packageName = props.pilihTanggalData?.package.value.packageName;
      if (packageName) {
        return !packageName.toLowerCase().includes('single');
      }
      return true;
    });

    function getToday() {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Set time to the start of the day (midnight)
      return now;
    }

    function getTwelveMonthsLater() {
      const twelveMonthsLater = new Date();
      twelveMonthsLater.setMonth(twelveMonthsLater.getMonth() + 6);
      return twelveMonthsLater;
    }

    function optionsFn(dateString: string) {
      const date = new Date(dateString.replace(/\//g, '-')); // Convert string to Date
      const today = getToday();
      const twelveMonthsLater = getTwelveMonthsLater();
      return date >= today && date <= twelveMonthsLater;
    }

    const recurrence = ref('Does not repeat');
    const recurrenceOptions = reactive([
      'Does not repeat',
      'Weekly',
      'Monthly',
    ]);

    const saveEvent = async () => {
      const data: IBooking = {
        sport: choosenData.value.sport.value,
        package: choosenData.value.package.value,
        field: choosenData.value.field.value,
        user: userStore.currentUser,
        startTime: dateTime.value.replace(/\//g, '-'),
      };

      const result = await liveData.saveNewBooking(data);
      // window.location.reload();
      if (result === 'OK') {
        window.location.reload();
      } else {
        Swal.fire('Warning', result, 'warning');
      }
      // Additional logic for saving the event
    };

    const updateEvent = async () => {
      const data: IBooking = {
        sport: choosenData.value.sport.value,
        package: choosenData.value.package.value,
        field: choosenData.value.field.value,
        user: userStore.currentUser,
        startTime: dateTime.value.replace(/\//g, '-'),
      };

      const result = await liveData.updateNewBooking(
        data,
        choosenData.value.id
      );
      // window.location.reload();
      if (result === 'OK') {
        // Swal.fire('Success', result, 'success');
        window.location.reload();
      } else {
        Swal.fire('Warning', result, 'warning');
      }
      // Additional logic for saving the event
    };

    const deleteEvent = async () => {
      const result = await liveData.deleteNewBooking(choosenData.value.id);
      // window.location.reload();
      if (result) {
        // Swal.fire('Success', result, 'success');
        window.location.reload();
      } else {
        Swal.fire('Warning', 'Error Delete!', 'warning');
      }
      // Additional logic for saving the event
    };

    onMounted(async () => {
      await liveData.fetchNewBookings();
    });

    console.log(availableHourOptions.value);

    return {
      dateTime,
      selectedDate,
      selectedTime,
      timeOptions,
      recurrence,
      recurrenceOptions,
      hourOption,
      canReccuring,
      saveEvent,
      updateEvent,
      optionsFn,
      deleteEvent,
      availableHourOptions,
      availableMinuteOptions,
      isEdit,
      prevDate,
    };
  },
});
</script>
