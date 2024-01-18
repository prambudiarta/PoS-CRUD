<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Court Reservation</div>
      </q-card-section>

      <q-card-section class="flex flex-center q-gutter-md">
        <div class="q-pa-md" style="max-width: 300px">
          <q-input filled v-model="date">
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="date"
                    mask="YYYY-MM-DD HH:mm"
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
                    v-model="date"
                    mask="YYYY-MM-DD HH:mm"
                    format24h
                    :minute-options="timeOptions"
                    :hour-options="hourOption"
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

      <q-card-section v-if="canReccuring">
        <q-select
          v-model="recurrence"
          :options="recurrenceOptions"
          label="Recurrence"
          emit-value
          map-options
        />
      </q-card-section>

      <q-card-section align="right">
        <q-btn label="Save" color="primary" @click="saveEvent" />
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
import { useUserStore } from 'src/stores/user-store';
import { computed, defineComponent } from 'vue';

/**
 * TODO:
 * 1. Bikin Minion untuk analisa ketersediaan setiap pilih duration options
 * 2. Untuk durasi juga sudah di analisa sama minion, minimum adalah 1 jam, maximum adalah selama analisa minium tersedia
 */
import { ref, reactive } from 'vue';

// interface iPurchase {
// 	bookingCode: string,
// 	startTime: string,
// 	endTime: string,
// 	repeat: OneTime | Weekly | Monthly -> tentative
// 	sport: iSports
// 	field: iField
// 	package: iPackage
// 	user: iUser
// 	createdTimeStamp: Firebase.TimeStamp | epoch
// 	playTimeStamp: Firebase.TimeStamp -> Proof Of Concept -> intinya untuk memudahkan filterasi
// }

// docId -> tanggalMulai_Bulan_StartTime_EndTime_userId_bookingCode
// contoh: 24_12_16:00_17:30_user123_bc123 -> biar

export default defineComponent({
  props: {
    pilihTanggalData: Object,
  },
  setup(props) {
    const userStore = useUserStore();

    const choosenData = ref({ ...props.pilihTanggalData });
    const timeOptions = [0, 30];
    const hourOption = [
      8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
    ];

    const canReccuring = computed(() => {
      const packageName = props.pilihTanggalData?.package.value.packageName;
      if (packageName) {
        return !packageName.toLowerCase().includes('single');
      }
      return true;
    });

    const date = ref(new Date().toISOString().split('T')[0].replace(/-/g, '/'));

    function getToday() {
      return new Date();
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

    const saveEvent = () => {
      console.log('saveEvent');

      const data = {
        sport: choosenData.value.sport.value,
        package: choosenData.value.package.value,
        field: choosenData.value.field.value,
        user: userStore.currentUser,
      };
      console.log(choosenData.value);
      console.log(data);
      // Additional logic for saving the event
    };

    return {
      date,
      timeOptions,
      recurrence,
      recurrenceOptions,
      hourOption,
      canReccuring,
      saveEvent,
      optionsFn,
    };
  },
});
</script>
