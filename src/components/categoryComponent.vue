<template>
  <q-dialog v-model="dialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          {{ isEditMode ? 'Edit Category' : 'Create Category' }}
        </div>
      </q-card-section>

      <q-card-section>
        <!-- Form for category data -->
        <q-input v-model="localCategory.category" label="Category Name" />
        <!-- Image upload and preview -->
        <div
          v-if="localCategory.imageUrl"
          class="q-mt-md"
          @click="triggerFileInput"
        >
          <img
            :src="localCategory.imageUrl"
            alt="Image preview"
            class="image-preview"
          />
        </div>
        <input
          type="file"
          ref="fileInput"
          accept="image/*"
          @change="handleFileChange"
          hidden
        />
        <q-btn flat @click="triggerFileInput" label="Upload Image" />
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
    isOpen: Boolean,
  },
  setup(props, { emit }) {
    const { isOpen } = toRefs(props);
    const dialog = ref(isOpen.value);
    const localCategory = ref({ ...props.category });
    const isEditMode = computed(() => props.category && props.category.id);
    const fileInput = ref(null);
    const itemStore = useItemStore();

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

    const triggerFileInput = () => {
      fileInput.value.click();
    };

    const handleFileChange = () => {
      if (fileInput.value && fileInput.value.files.length > 0) {
        const file = fileInput.value.files[0];
        localCategory.value.imageUrl = URL.createObjectURL(file);
      }
    };

    const saveCategory = async () => {
      try {
        if (isEditMode.value) {
          await itemStore.updateCategory(
            localCategory.value,
            fileInput.value.files[0]
          );
        } else {
          await itemStore.saveCategory(
            localCategory.value,
            fileInput.value.files[0]
          );
        }
        dialog.value = false;
        emit('save');
      } catch (error) {
        console.error('Error saving category:', error);
      }
    };

    return {
      dialog,
      localCategory,
      isEditMode,
      fileInput,
      triggerFileInput,
      handleFileChange,
      saveCategory,
    };
  },
};
</script>

<style>
.image-preview {
  max-width: 100%;
  max-height: 200px; /* Adjust as needed */
}
</style>
