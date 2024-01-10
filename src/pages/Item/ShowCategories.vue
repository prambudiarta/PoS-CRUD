<template>
  <q-page padding>
    <div class="flex justify-between q-mb-md">
      <q-btn
        label="Create Categories"
        color="primary"
        @click="openNewCategoryForm"
        class="q-mr-md"
      />
      <q-input v-model="searchQuery" placeholder="Search category by name..." />
    </div>
    <q-table
      title="Category List"
      :rows="filteredCategory"
      :columns="columns"
      row-key="id"
    >
      <!-- Custom slot for image -->
      <template v-slot:body-cell-image="props">
        <q-td :props="props">
          <img :src="props.row.imageUrl" alt="Item Image" height="50" />
        </q-td>
      </template>

      <!-- Custom slot for edit button -->
      <template v-slot:body-cell-edit="props">
        <q-td :props="props">
          <q-btn flat icon="edit" @click="editCategory(props.row)" />
          <q-btn flat icon="delete" @click="deleteCategory(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- Add the CategoryForm component -->
    <category-form
      ref="categoryForm"
      :category="editableCategory"
      :isOpen="isDialogOpen"
      @save="updateCategory"
    />
  </q-page>
</template>

<script lang="ts">
import { ref, onMounted, Ref, watch, computed } from 'vue';
import { useItemStore } from 'src/stores/item-store';
import { Categories } from 'src/types/interfaces';
import { QTableColumn } from 'quasar';
import Swal from 'sweetalert2';
import CategoryForm from 'src/components/categoryComponent.vue';

export default {
  components: { CategoryForm },
  setup() {
    type CategoryFormComponent = {
      dialog: boolean;
      openDialog: () => void; // If you have a method to open the dialog
      // Add other methods or properties you need to access
    };
    const isDialogOpen = ref(false);
    const itemStore = useItemStore();
    const categories = ref<Categories[]>([]);
    const categoryForm = ref() as Ref<CategoryFormComponent | null>;
    const editableCategory = ref({});
    const searchQuery = ref('');

    const openNewCategoryForm = () => {
      editableCategory.value = {}; // Reset or set up a new item structure
      isDialogOpen.value = true;
    };

    const filteredCategory = computed(() => {
      if (!searchQuery.value) {
        return categories.value; // Return all items if search query is empty
      }
      return categories.value.filter((categories) =>
        categories.category
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase())
      );
    });

    const columns: QTableColumn[] = [
      {
        name: 'category',
        required: true,
        label: 'Category',
        align: 'left',
        field: (row: Categories) => row.category,
        sortable: true,
      },
      {
        name: 'image',
        label: 'Image',
        field: 'imageUrl',
        align: 'center',
        sortable: false,
      },
      {
        name: 'edit',
        label: 'Action',
        field: 'editAction',
        align: 'center',
        sortable: false,
      },
      // Add more columns as needed
    ];

    const fetchCategories = async () => {
      await itemStore.fetchCategories();
      categories.value = itemStore.categories;
      console.log(categories.value);
    };

    const editCategory = (category: Categories) => {
      editableCategory.value = category;
      isDialogOpen.value = true;
    };

    const updateCategory = async (category: Categories) => {
      // Call the store method to update the item
      // await itemStore.updateCategory(category);
      // Refresh items list or handle UI update here
    };

    const deleteCategory = async (category: Categories) => {
      if (typeof category.id === 'undefined') {
        Swal.fire('Error', 'Category ID is undefined.', 'error');
        return;
      }

      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      }).then(async (result) => {
        if (result.isConfirmed) {
          if (typeof category.id === 'undefined') {
            Swal.fire('Error', 'Category ID is undefined.', 'error');
            return;
          } else {
            await itemStore.deleteCategoriy(category.id);
            await itemStore.fetchCategories();
            categories.value = itemStore.categories;
            Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
            // Refresh items list or handle UI update here
          }
        }
      });
    };

    watch(
      () => categoryForm.value?.dialog,
      (newVal) => {
        if (newVal === false) {
          isDialogOpen.value = false;
        }
      }
    );

    onMounted(fetchCategories);

    return {
      categories,
      columns,
      categoryForm,
      editableCategory,
      isDialogOpen,
      searchQuery,
      filteredCategory,
      openNewCategoryForm,
      editCategory,
      updateCategory,
      deleteCategory,
      fetchCategories,
    };
  },
};
</script>
