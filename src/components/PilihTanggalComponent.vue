<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Court Reservation</div>
      </q-card-section>

      <q-card-section class="flex flex-center q-gutter-md">
        <q-date v-model="date" />
        <q-time v-model="time" format24h with-minutes :minute-interval="15" />
      </q-card-section>

      <q-card-section>
        <q-select
          v-model="duration"
          :options="durationOptions"
          label="Duration (hours)"
          emit-value
          map-options
        />
      </q-card-section>

      <q-card-section>
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

<script>
/**
 * TODO:
 * 1. Bikin Minion untuk analisa ketersediaan setiap pilih duration options
 * 2. Untuk durasi juga sudah di analisa sama minion, minimum adalah 1 jam, maximum adalah selama analisa minium tersedia
 */

export default {
  data() {
    return {
      date: '',
      time: {
        hours: 10,
        minutes: 15,
      },
      duration: 1, // default duration set to 1 hour
      durationOptions: [
        { label: '1 hour', value: 1 },
        { label: '1.5 hour', value: 1.5 },
        { label: '2 hours', value: 2 },
        { label: '2.5 hours', value: 2.5 },
        { label: '3 hours', value: 3 },
        { label: '3.5 hours', value: 3.5 },
        { label: '4 hours', value: 4 },
        { label: '4.5 hours', value: 4.5 },
        { label: '5 hours', value: 5 },
        { label: '5.5 hours', value: 5.5 },
        { label: '6 hours', value: 6 },
      ],
      recurrence: 'Does not repeat',
      recurrenceOptions: ['Does not repeat', 'Weekly', 'Monthly'],
    };
  },
  methods: {
    saveEvent() {
      // Process the save event logic here
      console.log(
        'Court Reserved:',
        this.date,
        this.time,
        this.duration,
        this.recurrence
      );
    },
  },
};
</script>
