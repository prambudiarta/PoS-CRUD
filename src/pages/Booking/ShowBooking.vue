<template>
  <q-page padding>
    <div class="q-pa-md">
      <div v-if="!isCommunity">
        <q-select
          filled
          v-model="selectedUser"
          :options="usersOption"
          label="Select User"
          @click="onUserSelect"
        />
        <q-select
          filled
          v-model="selectedSport"
          :options="sportsOptions"
          label="Select Sport"
          class="q-mt-md"
          @click="onSportSelect"
          :disable="!selectedUser"
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
        <q-select
          v-if="canReccuring"
          v-model="recurrence"
          :options="recurrenceOptions"
          label="Recurrence"
          class="q-mt-md"
        />
        <q-btn
          :disable="!selectedPackage"
          label="Pilih Waktu"
          color="primary"
          class="q-mt-md"
          @click="toggleTanggal"
        />
      </div>
      <div class="row q-mt-md">
        <calendar-component class="full-width" />
      </div>
    </div>

    <!-- Dialog that contains the PilihTanggal component -->
    <q-dialog v-model="dialogTanggal">
      <PilihTanggal ref="pilihTanggalData" :pilih-tanggal-data="allData" />
    </q-dialog>
    <q-inner-loading
      :showing="loading"
      label="Please wait..."
      label-class="text-blue"
      label-style="font-size: 1.1em"
    />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, Ref, reactive } from 'vue';
import { IField, User } from 'src/types/interfaces';
import { useLiveData } from 'src/stores/live-data';
import CalendarComponent from 'src/components/CalendarComponent.vue';
import PilihTanggal from 'src/components/PilihTanggalComponent.vue';
import { useUserStore } from 'src/stores/user-store';

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
    const user = ref([] as User[]);
    const selectedSport = ref(null);
    const selectedField = ref(null);
    const selectedPackage = ref(null);
    const selectedUser = ref(null);
    const showPackageDialog = ref(false);
    const dialogTanggal = ref(false);
    const allData = ref({});
    const recurrence = ref('Does not repeat');
    const recurrenceOptions = reactive(['Does not repeat', 'Weekly']);
    const isManager = ref(false);
    const isCommunity = ref(false);
    const loading = ref(true);

    const pilihTanggalData = ref() as Ref<PilihTanggalComponent | null>;

    const liveData = useLiveData();

    const userStore = useUserStore();

    const loadFields = async () => {
      await liveData.loadFields();
      await liveData.loadUser();
      loading.value = false;

      user.value = liveData.user.filter(
        (user) =>
          user.role !== 'Manager' &&
          user.role !== 'Super Admin' &&
          user.role !== 'Customer Service'
      );
      fields.value = liveData.fields;
    };

    const canReccuring = computed(() => {
      if (selectedPackage.value) {
        const packageName = selectedPackage.value.label;
        if (packageName) {
          return !packageName.toLowerCase().includes('single');
        }
        return true;
      }
      return false;
    });

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

    const usersOption = computed(() => {
      return user.value.map((user) => ({
        label: user.name,
        value: user,
      }));
    });

    const toggleTanggal = () => {
      allData.value = {
        isEdit: false,
        package: selectedPackage.value,
        sport: selectedSport.value,
        field: selectedField.value,
        user: selectedUser.value,
        recurrence: recurrence.value,
      };

      dialogTanggal.value = !dialogTanggal.value;
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

    const onUserSelect = () => {
      selectedField.value = null;
      selectedPackage.value = null;
      selectedSport.value = null;
    };

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

    onMounted(() => {
      loadFields();
      if (
        userStore.currentUser.role === 'Manager' ||
        userStore.currentUser.role === 'Super Admin'
      ) {
        isManager.value = true;
      } else if (userStore.currentUser.role === 'Community') {
        isCommunity.value = true;
      }
    });

    return {
      fields,
      selectedSport,
      selectedField,
      selectedPackage,
      selectedUser,
      usersOption,
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
      canReccuring,
      toggleTanggal,
      onUserSelect,
      recurrence,
      recurrenceOptions,
      isCommunity,
      isManager,
      loading,
    };
  },
});
</script>

<style>
.q-dialog {
  z-index: 1050;
  /* Set to a value lower than Swal's default z-index */
}
</style>
