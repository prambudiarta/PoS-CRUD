<template>
  <q-dialog v-model="dialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          {{ isEditMode ? 'Edit Category' : 'Create Category' }}
        </div>
      </q-card-section>

      <q-card-section>
        <!-- Form for item data -->
        <q-input v-model="localCategory.category" label="Category Name" />
        <!-- Add other fields as needed -->
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="Save" color="primary" @click="saveCategory" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch, toRefs } from 'vue';
import { useItemStore } from 'src/stores/item-store';

export default {
  props: {
    category: Object,
    isOpen: Boolean, // Add this prop for external control
  },
  setup(props, { emit }) {
    const { isOpen } = toRefs(props); // Destructure isOpen from props
    const dialog = ref(isOpen.value);
    const localCategory = ref({ ...props.category });
    const isEditMode = computed(() => props.category && props.category.id);

    const itemStore = useItemStore();

    console.log('props');
    console.log(props);

    // Watch for changes in isOpen prop
    watch(isOpen, (newValue) => {
      dialog.value = newValue;
    });

    watch(
      () => props.category,
      (newCategory) => {
        localCategory.value = { ...newCategory };
      },
      { deep: true }
    );

    const saveCategory = async () => {
      try {
        if (isEditMode.value) {
          // Existing item: update it
          await itemStore.updateCategory(localCategory.value);
        } else {
          // New item: add it
          await itemStore.saveCategory(localCategory.value);
        }
        dialog.value = false;
        emit('save');
      } catch (error) {
        console.error('Error saving category:', error);
        // Handle the error, e.g., show a notification to the user
      }
    };

    return {
      dialog,
      localCategory,
      isEditMode,
      saveCategory,
    };
  },
};
</script>
