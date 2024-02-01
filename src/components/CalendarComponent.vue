<template>
  <div class="subcontent">
    <navigation-bar @today="onToday" @prev="onPrev" @next="onNext" />

    <div class="row justify-center">
      <div style="display: flex; max-width: 800px; width: 100%; height: 900px">
        <q-calendar-agenda
          ref="calendarRef"
          v-model="selectedDate"
          view="week"
          :weekdays="[0, 1, 2, 3, 4, 5, 6, 7]"
          :day-min-height="200"
          :start-time="0"
          :end-time="24"
          :interval="60"
          bordered
          animated
          locale="id-ID"
        >
          <template #day="{ scope: { timestamp } }">
            <template
              v-for="a in getAgenda(timestamp)"
              :key="timestamp.date + a.time"
            >
              <div
                :label="a.time"
                :class="a.style"
                style="margin-top: 25px"
                @click="toggleTanggal(a)"
              >
                <div
                  v-if="a.avatar"
                  class="row justify-center"
                  style="margin-top: 30px; width: 100%"
                >
                  <q-avatar
                    style="
                      margin-top: -50px;
                      margin-bottom: 10px;
                      font-size: 60px;
                    "
                  >
                    <img :src="a.avatar" style="border: #9e9e9e solid 5px" />
                  </q-avatar>
                </div>
                <div class="col-12 q-px-sm">
                  <strong>{{ a.time }}</strong>
                </div>
                <div
                  v-if="a.desc"
                  class="col-12 q-px-sm"
                  style="font-size: 10px"
                >
                  {{ a.desc }}
                </div>
              </div>
            </template>
          </template>
        </q-calendar-agenda>

        <q-dialog v-model="dialogTanggal">
          <PilihTanggal ref="pilihTanggalData" :pilih-tanggal-data="allData" />
        </q-dialog>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch, Ref } from 'vue';
import NavigationBar from '../components/NavigationBar.vue';
import { useLiveData } from 'src/stores/live-data'; // Adjust the path
import { IBooking } from 'src/types/interfaces';
import {
  QCalendarAgenda,
  today,
} from '@quasar/quasar-ui-qcalendar/src/index.js';
import '@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass';
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass';
import '@quasar/quasar-ui-qcalendar/src/QCalendarAgenda.sass';
import PilihTanggal from 'src/components/PilihTanggalComponent.vue';
import { useUserStore } from 'src/stores/user-store';

export default defineComponent({
  name: 'AgendaColumnOptions',
  components: {
    NavigationBar,
    PilihTanggal,
    QCalendarAgenda,
  },
  setup() {
    const liveData = useLiveData();
    const selectedDate = ref(today());
    const dataBooking = computed(() => liveData.newBooking);
    const calendarRef: Ref<any> = ref(null);
    const dialogTanggal = ref(false);
    const allData = ref({});
    const isManager = ref(false);

    const agenda = computed(() => parseData(dataBooking.value));
    const userStore = useUserStore();
    // Fetch new bookings when component is mounted
    onMounted(async () => {
      await liveData.fetchNewBookings();
      if (
        userStore.currentUser.role === 'Manager' ||
        userStore.currentUser.role === 'super-admin'
      ) {
        isManager.value = true;
      }
    });

    function parseData(dataArray: IBooking[]) {
      try {
        const parsedData = {};
        const colorList = ['bg-red-2', 'bg-green-2', 'bg-blue-2'];
        const fieldColorMap = {};

        dataArray.forEach((data, index) => {
          // Convert startTime to a Date object
          const date = new Date(data.startTime);

          // Format the date as a string 'YYYY-MM-DD'
          const dateString = date.toISOString().split('T')[0];

          if (!parsedData[dateString]) {
            parsedData[dateString] = [];
          }

          // Assign a color from colorList to the field if it hasn't been assigned yet
          if (!fieldColorMap[data.field.fieldName]) {
            // Use modulo to cycle through the colorList if more field names than colors
            fieldColorMap[data.field.fieldName] =
              colorList[Object.keys(fieldColorMap).length % colorList.length];
          }

          // Get the assigned color for the field
          const fieldColor = fieldColorMap[data.field.fieldName];

          console.log(data.field.fieldName);

          parsedData[dateString].push({
            data: data,
            style: `justify-start q-ma-sm shadow-5 ${fieldColor}`,
            time: data.startTime.split(' ')[1],
            avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
            desc: `${data.field.fieldName} ${data.sport.sportName} ${data.user.name}`,
          });
        });

        return parsedData;
      } catch (e) {
        console.error(e); // It's good practice to log the error
        return {};
      }
    }

    const getAgenda = computed(() => {
      return (timestamp) => {
        // Format the timestamp date as 'YYYY-MM-DD'
        const dateKey = new Date(timestamp.date).toISOString().split('T')[0];
        return agenda.value[dateKey] || [];
      };
    });

    const toggleTanggal = (data: any) => {
      if (isManager.value) {
        allData.value = {
          isEdit: true,
          id: data.data.id,
          startTime: data.data.startTime,
          package: { label: 'Package', value: data.data.package },
          sport: { label: 'Sport', value: data.data.sport },
          field: { label: 'Field', value: data.data.field },
          user: { label: 'User', value: data.data.user },
          recurrence: 'Does not repeat',
        };
        dialogTanggal.value = !dialogTanggal.value;
      }
    };

    const onToday = () => {
      if (calendarRef.value) {
        calendarRef.value.moveToToday();
      }
    };

    const onPrev = () => {
      if (calendarRef.value) {
        calendarRef.value.prev();
      }
    };

    const onNext = () => {
      if (calendarRef.value) {
        calendarRef.value.next();
      }
    };

    return {
      calendarRef,
      selectedDate,
      getAgenda,
      dialogTanggal,
      allData,
      isManager,
      toggleTanggal,
      onToday,
      onPrev,
      onNext,
      //... other methods
    };
  },
});
</script>
