<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row">
        <q-select
          filled
          v-model="selectedSport"
          :options="sportsOptions"
          label="Select Sport"
          @click="onSportSelect"
          class="full-width"
        />
      </div>
      <div class="row q-mt-md">
        <q-select
          filled
          v-model="selectedField"
          :options="fieldOptions"
          label="Select Field"
          @click="onFieldSelect"
          :disable="!selectedSport"
          class="full-width"
        />
      </div>
      <div class="row q-mt-md">
        <q-select
          filled
          v-model="selectedPackage"
          :options="packageOptions"
          :disable="!selectedSport"
          label="Select Package"
          class="full-width"
        />
      </div>
      <div class="row q-mt-md">
        <q-btn
          :disable="!selectedPackage"
          label="Pilih Waktu"
          color="primary"
        />
      </div>
      <div class="row q-mt-md">
        <calendar-component class="full-width" />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { IField } from 'src/types/interfaces';
import { useLiveData } from 'src/stores/live-data';
import CalendarComponent from 'src/components/CalendarComponent.vue';

export default defineComponent({
  components: { CalendarComponent },
  name: 'SelectPackagePage',
  setup() {
    const fields = ref([] as IField[]); // Load this from Firestore or other source
    const selectedSport = ref(null);
    const selectedField = ref(null);
    const selectedPackage = ref(null);
    const showPackageDialog = ref(false);

    const liveData = useLiveData();

    const loadFields = async () => {
      await liveData.loadFields();

      fields.value = liveData.fields;
    };

    const sportsOptions = computed(() => {
      const allSports = fields.value.flatMap((field) => field.sports);
      const uniqueSports = [
        ...new Map(
          allSports.map((sport) => [sport['sportName'], sport])
        ).values(),
      ];
      return uniqueSports.map((sport) => ({
        label: sport.sportName,
        value: sport.sportName,
      }));
    });

    const fieldOptions = computed(() => {
      if (!selectedSport.value) return [];
      return fields.value
        .filter((field) =>
          field.sports.some(
            (sport) => sport.sportName === selectedSport.value.value
          )
        )
        .map((field) => ({ label: field.fieldName, value: field.fieldId }));
    });

    const packageOptions = computed(() => {
      if (!selectedSport.value || !selectedField.value) return [];
      const selectedFieldData = fields.value.find(
        (field) => field.fieldId === selectedField.value.value
      );
      const selectedSportData = selectedFieldData?.sports.find(
        (sport) => sport.sportName === selectedSport.value.value
      );
      return (
        selectedSportData?.packages.map((pck) => ({
          label: pck.packageName,
          value: pck,
        })) || []
      );
    });

    const onSportSelect = () => {
      selectedField.value = null;
      selectedPackage.value = null;
    };

    const onFieldSelect = () => {
      selectedPackage.value = null;
    };

    const openPackageDialog = () => {
      showPackageDialog.value = true;
    };

    onMounted(loadFields);

    return {
      fields,
      selectedSport,
      selectedField,
      selectedPackage,
      sportsOptions,
      fieldOptions,
      packageOptions,
      showPackageDialog,
      onFieldSelect,
      onSportSelect,
      openPackageDialog,
    };
  },
});
</script>
