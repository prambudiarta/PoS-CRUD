<template>
  <q-dialog v-model="dialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          {{ isEditMode ? 'Edit Room' : 'Create Room' }}
        </div>
      </q-card-section>

      <q-card-section>
        <!-- Form for item data -->
        <q-input v-model="localRoom.id" label="Device Id" />
        <q-input v-model="localRoom.description" label="Room" />
        <q-input
          v-model="localRoom.price"
          label="Price per Hour"
          type="number"
        />
        <!-- Add other fields as needed -->
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="Save" color="primary" @click="saveRoom" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch, toRefs } from 'vue';
import { useDeviceStore } from 'src/stores/device-store';

export default {
  props: {
    room: Object,
    isOpen: Boolean, // Add this prop for external control
  },
  setup(props, { emit }) {
    const { isOpen } = toRefs(props); // Destructure isOpen from props
    const dialog = ref(isOpen.value);
    const localRoom = ref({ ...props.room });
    const isEditMode = computed(() => props.room && props.room.id);

    const deviceStore = useDeviceStore();

    // Watch for changes in isOpen prop
    watch(isOpen, (newValue) => {
      dialog.value = newValue;
    });

    watch(
      () => props.room,
      (newCategory) => {
        localRoom.value = { ...newCategory };
      },
      { deep: true }
    );

    const saveRoom = async () => {
      try {
        if (isEditMode.value) {
          // Existing item: update it
          await deviceStore.updateRoom(localRoom.value);
        } else {
          // New item: add it
          await deviceStore.saveRoom(localRoom.value);
        }
        dialog.value = false;
        emit('save');
      } catch (error) {
        console.error('Error saving Room:', error);
        // Handle the error, e.g., show a notification to the user
      }
    };

    return {
      dialog,
      localRoom,
      isEditMode,
      saveRoom,
    };
  },
};
</script>
