<template>
  <q-dialog v-model="dialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          {{ isEditMode ? 'Edit Lapangan' : 'Create Lapangan' }}
        </div>
      </q-card-section>

      <q-card-section>
        <!-- Form for lapangan data -->
        <q-input v-model="localLapangan.nama" label="Nama" />
        <q-input v-model="localLapangan.deskripsi" label="Deskripsi" />
        <q-input v-model="localLapangan.harga" label="Harga" type="number" />
        <!-- Add other fields as needed for lapangan -->
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="Save" color="primary" @click="saveLapangan" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch, toRefs } from 'vue';
import { useLiveData } from 'src/stores/live-data';

export default {
  props: {
    lapangan: Object,
    isOpen: Boolean,
  },
  setup(props, { emit }) {
    const { isOpen } = toRefs(props); // Destructure isOpen from props
    const dialog = ref(isOpen.value);
    const localLapangan = ref({ ...props.lapangan });
    const isEditMode = computed(() => props.lapangan && props.lapangan.id);
    const liveDataStore = useLiveData();

    // Watch for changes in isOpen prop
    watch(isOpen, (newValue) => {
      dialog.value = newValue;
    });

    watch(
      () => props.lapangan,
      (newLapangan) => {
        localLapangan.value = { ...newLapangan };
      },
      { deep: true }
    );

    const saveLapangan = async () => {
      try {
        if (isEditMode.value) {
          // Existing lapangan: update it
          await liveDataStore.updateLapangan(localLapangan.value);
        } else {
          // New lapangan: add it
          await liveDataStore.saveLapangan(localLapangan.value);
        }

        // Close the dialog and refresh the lapangan list
        dialog.value = false;
      } catch (error) {
        console.error('Error saving lapangan:', error);
        // Handle the error, e.g., show a notification to the user
      }
      emit('save');
    };

    return {
      dialog,
      localLapangan,
      isEditMode,
      saveLapangan,
    };
  },
};
</script>

<style>
.image-preview {
  max-width: 100%;
  max-height: 200px; /* Adjust the size as needed */
}
</style>
