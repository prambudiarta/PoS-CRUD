<template>
  <q-dialog v-model="dialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          {{ isEditMode ? 'Edit Printer' : 'Create Printer' }}
        </div>
      </q-card-section>

      <q-card-section>
        <!-- Form for item data -->
        <q-input v-model="localPrinter.id" label="Printer Id" />
        <q-input v-model="localPrinter.description" label="Deskripsi" />
        <!-- Add other fields as needed -->
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="Save" color="primary" @click="savePrinter" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch, toRefs } from 'vue';
import { useDeviceStore } from 'src/stores/device-store';

export default {
  props: {
    printer: Object,
    isOpen: Boolean, // Add this prop for external control
  },
  setup(props, { emit }) {
    const { isOpen } = toRefs(props); // Destructure isOpen from props
    const dialog = ref(isOpen.value);
    const localPrinter = ref({ ...props.printer });
    const isEditMode = computed(() => props.printer && props.printer.id);

    const deviceStore = useDeviceStore();

    // Watch for changes in isOpen prop
    watch(isOpen, (newValue) => {
      dialog.value = newValue;
    });

    watch(
      () => props.printer,
      (newCategory) => {
        localPrinter.value = { ...newCategory };
      },
      { deep: true }
    );

    const savePrinter = async () => {
      try {
        // if (isEditMode.value) {
        //   // Existing item: update it
        //   await deviceStore.updatePrinter(localPrinter.value);
        // } else {
        // New item: add it
        await deviceStore.savePrinter(localPrinter.value);
        // }
        dialog.value = false;
        emit('save');
      } catch (error) {
        console.error('Error saving Printer:', error);
        // Handle the error, e.g., show a notification to the user
      }
    };

    return {
      dialog,
      localPrinter,
      isEditMode,
      savePrinter,
    };
  },
};
</script>
