<template>
  <q-dialog v-model="dialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          {{ isEditMode ? 'Edit Item' : 'Create Item' }}
        </div>
      </q-card-section>

      <q-card-section>
        <!-- Form for item data -->
        <q-input v-model="localItem.name" label="Item Name" />
        <q-input v-model="localItem.price" label="Price" type="number" />
        <q-select
          v-model="localItem.category"
          :options="categories"
          label="Category"
        />
        <!-- Add other fields as needed -->
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="Save" color="primary" @click="saveItem" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch, toRefs } from 'vue';

export default {
  props: {
    item: Object,
    categories: Array,
    isOpen: Boolean, // Add this prop for external control
  },
  setup(props, { emit }) {
    const { isOpen } = toRefs(props); // Destructure isOpen from props
    const dialog = ref(isOpen.value);
    const localItem = ref({ ...props.item });
    const isEditMode = computed(() => props.item && props.item.id);

    // Watch for changes in isOpen prop
    watch(isOpen, (newValue) => {
      dialog.value = newValue;
    });

    watch(
      () => props.item,
      (newItem) => {
        localItem.value = { ...newItem };
      },
      { deep: true }
    );

    const saveItem = () => {
      emit('save', localItem.value);
      dialog.value = false;
    };

    return {
      dialog,
      localItem,
      isEditMode,
      saveItem,
    };
  },
};
</script>
