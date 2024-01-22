<template>
  <div class="subcontent">
    <navigation-bar @today="onToday" @prev="onPrev" @next="onNext" />

    <div class="row justify-center">
      <div style="display: flex; max-width: 800px; width: 100%; height: 400px">
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
import calculateEndTime from 'src/utils/calculateEndTime';

export default defineComponent({
  name: 'AgendaColumnOptions',
  components: {
    NavigationBar,
    QCalendarAgenda,
  },
  setup() {
    const liveData = useLiveData();
    const selectedDate = ref(today());
    const dataBooking = computed(() => liveData.newBooking);
    const calendarRef: Ref<any> = ref(null);

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
            time: data.startTime.split(' ')[1],
            avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
            desc: `${data.sport.sportName} ${data.package.details}`,
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
      onToday,
      onPrev,
      onNext,
      //... other methods
    };
  },
});
</script>

<!-- <script>
import {
  QCalendarAgenda,
  today,
} from '@quasar/quasar-ui-qcalendar/src/index.js';
import '@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass';
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass';
import '@quasar/quasar-ui-qcalendar/src/QCalendarAgenda.sass';

import { defineComponent, computed } from 'vue';
import NavigationBar from '../components/NavigationBar.vue';
import { useLiveData } from 'src/stores/live-data';

export default defineComponent({
  name: 'AgendaColumnOptions',
  components: {
    NavigationBar,
    QCalendarAgenda,
  },
  data() {
    const liveData = useLiveData();
    const dataBooking = liveData.newBooking;

    return {
      selectedDate: today(),
      agenda: parseData(dataBooking),
    };
  },
  async mounted() {
    const liveData = useLiveData();
    await liveData.fetchNewBookings();
  },
  computed: {
    getAgenda() {
      return (day) => {
        return this.agenda[parseInt(day.weekday, 10)];
      };
    },
  },
  methods: {
    onToday() {
      this.$refs.calendar.moveToToday();
    },
    onPrev() {
      this.$refs.calendar.prev();
    },
    onNext() {
      this.$refs.calendar.next();
    },
    onMoved(data) {
      console.log('onMoved', data);
    },
    onChange(data) {
      console.log('onChange', data);
    },
    onClickDate(data) {
      console.log('onClickDate', data);
    },
    onClickTime(data) {
      console.log('onClickTime', data);
    },
    onClickInterval(data) {
      console.log('onClickInterval', data);
    },
    onClickHeadIntervals(data) {
      console.log('onClickHeadIntervals', data);
    },
    onClickHeadDay(data) {
      console.log('onClickHeadDay', data);
    },
  },
});

</script> -->
