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
                class="justify-start q-ma-sm shadow-5 bg-grey-6"
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

    const agenda = computed(() => parseData(dataBooking.value));
    // Fetch new bookings when component is mounted
    onMounted(async () => {
      await liveData.fetchNewBookings();
    });

    function parseData(dataArray: IBooking[]) {
      try {
        const parsedData = {};

        dataArray.forEach((data) => {
          // Convert startTime to a Date object
          const date = new Date(data.startTime);
          const dayOfWeek = date.getDay();

          // Format the date as a string 'YYYY-MM-DD'
          const dateString = date.toISOString().split('T')[0];

          if (!parsedData[dateString]) {
            parsedData[dateString] = [];
          }

          parsedData[dateString].push({
            data: data,
            time: data.startTime.split(' ')[1],
            avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
            desc: `${data.field.fieldName} ${data.sport.sportName} ${data.package.details}`,
          });
        });

        return parsedData;
      } catch (e) {
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
      allData.value = {
        isEdit: true,
        id: data.data.id,
        startTime: data.data.startTime,
        package: { label: 'Package', value: data.data.package },
        sport: { label: 'Sport', value: data.data.sport },
        field: { label: 'Field', value: data.data.field },
      };
      dialogTanggal.value = !dialogTanggal.value;
      console.log(allData.value);
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
      toggleTanggal,
      onToday,
      onPrev,
      onNext,
      //... other methods
    };
  },
});
</script>
