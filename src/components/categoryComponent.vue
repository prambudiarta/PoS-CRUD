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
          v-if="localCategory.imageUrl"
          type="file"
          ref="fileInput"
          accept="image/*"
          @change="handleFileChange"
          hidden
        />
        <input
          v-else
          type="file"
          ref="fileInput"
          accept="image/*"
          @change="handleFileChange"
        />
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
    const selectedImage = ref(null);
    const imagePreviewUrl = ref('');
    const fileInput = ref(null);
    const file = ref(null);
    const itemStore = useItemStore();

    const triggerFileInput = () => {
      fileInput.value.click();
    };

    const handleFileChange = () => {
      if (fileInput.value && fileInput.value.files.length > 0) {
        file.value = fileInput.value.files[0];
        // Handle the file change logic
        localCategory.value.imageUrl = URL.createObjectURL(file.value);
      }
    };

    // Watch for changes in isOpen prop
    watch(isOpen, (newValue) => {
      dialog.value = newValue;
    });

    watch(
      () => props.isOpen,
      (newValue) => {
        if (!newValue) {
          URL.revokeObjectURL(imagePreviewUrl.value);
          imagePreviewUrl.value = '';
        }
      }
    );

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
          await itemStore.updateCategory(localCategory.value, file.value);
        } else {
          // New item: add it
          await itemStore.saveCategory(localCategory.value, file.value);
        }
        selectedImage.value = null;

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
      imagePreviewUrl,
      saveCategory,
      triggerFileInput,
      handleFileChange,
    };
  },
};
</script>
