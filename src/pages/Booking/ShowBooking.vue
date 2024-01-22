<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-select
        filled
        v-model="selectedSport"
        :options="sportsOptions"
        label="Select Sport"
        @click="onSportSelect"
      />
      <q-select
        filled
        v-model="selectedField"
        :options="fieldOptions"
        label="Select Field"
        class="q-mt-md"
        @click="onFieldSelect"
        :disable="!selectedSport"
      />
      <q-select
        filled
        v-model="selectedPackage"
        :options="packageOptions"
        :disable="!selectedSport"
        label="Select Package"
        class="q-mt-md"
      />
      <q-btn
        :disable="!selectedPackage"
        label="Pilih Waktu"
        color="primary"
        class="q-mt-md"
        @click="toggleTanggal"
      />
      <div class="row q-mt-md">
        <calendar-component class="full-width" />
      </div>
    </div>

    <!-- Dialog that contains the PilihTanggal component -->
    <q-dialog v-model="dialogTanggal">
      <PilihTanggal ref="pilihTanggalData" :pilih-tanggal-data="allData" />
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, Ref } from 'vue';
import { IField } from 'src/types/interfaces';
import { useLiveData } from 'src/stores/live-data';
import CalendarComponent from 'src/components/CalendarComponent.vue';
import PilihTanggal from 'src/components/PilihTanggalComponent.vue';

export default defineComponent({
  components: { CalendarComponent, PilihTanggal },
  name: 'SelectPackagePage',
  setup() {
    type PilihTanggalComponent = {
      dialog: boolean;
      openDialog: () => void; // If you have a method to open the dialog
      // Add other methods or properties you need to access
    };
    const fields = ref([] as IField[]); // Load this from Firestore or other source
    const selectedSport = ref(null);
    const selectedField = ref(null);
    const selectedPackage = ref(null);
    const showPackageDialog = ref(false);
    const dialogTanggal = ref(false);
    const allData = ref({});

    const pilihTanggalData = ref() as Ref<PilihTanggalComponent | null>;

    const liveData = useLiveData();

    const loadFields = async () => {
      await liveData.loadFields();

      fields.value = liveData.fields;
    };

    const sportsOptions = computed(() => {
      const allSports = fields.value.flatMap((field) => field.sports);
      const uniqueSports = [
        ...new Map(
          allSports.map((sport) => [sport!['sportName'], sport])
        ).values(),
      ];
      return uniqueSports.map((sport) => ({
        label: sport!.sportName,
        value: sport,
      }));
    });

    const toggleTanggal = () => {
      dialogTanggal.value = !dialogTanggal.value;
      allData.value = {
        package: selectedPackage.value,
        sport: selectedSport.value,
        field: selectedField.value,
      };
    };

    const fieldOptions = computed(() => {
      if (!selectedSport.value) return [];
      return fields.value
        .filter((field) =>
          field.sports!.some(
            (sport) => sport.sportName === selectedSport.value!.value.sportName
          )
        )
        .map((field) => ({ label: field.fieldName, value: field }));
    });

    const packageOptions = computed(() => {
      if (!selectedSport.value || !selectedField.value) return [];
      const selectedFieldData = fields.value.find(
        (field) => field.fieldId === selectedField.value.value.fieldId
      );
      const selectedSportData = selectedFieldData?.sports.find(
        (sport) => sport.sportName === selectedSport.value.value.sportName
      );
      return (
        selectedSportData?.packages?.map((pck) => ({
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
      pilihTanggalData,
      allData,
      onFieldSelect,
      onSportSelect,
      openPackageDialog,
      dialogTanggal,
      toggleTanggal,
    };
  },
});
</script>
