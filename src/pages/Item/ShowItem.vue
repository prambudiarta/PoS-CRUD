<template>
  <q-page padding>
    <div class="flex justify-between q-mb-md">
      <q-btn
        label="Create Item"
        color="primary"
        @click="openNewItemForm"
        class="q-mr-md"
      />
      <q-input v-model="searchQuery" placeholder="Search items by name..." />
    </div>
    <q-table
      title="Items List"
      :rows="filteredItems"
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
          <q-btn flat icon="edit" @click="editItem(props.row)" />
          <q-btn flat icon="delete" @click="deleteItem(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- Add the ItemForm component -->
    <item-form
      ref="itemForm"
      :item="editableItem"
      :isOpen="isDialogOpen"
      @save="updateItem"
    />
  </q-page>
</template>

<script lang="ts">
import { ref, onMounted, Ref, watch, computed } from 'vue';
import { useItemStore } from 'src/stores/item-store';
import { Item } from 'src/types/interfaces';
import { QTableColumn } from 'quasar';
import Swal from 'sweetalert2';
import ItemForm from 'src/components/ItemComponent.vue';

export default {
  components: { ItemForm },
  setup() {
    type ItemFormComponent = {
      dialog: boolean;
      openDialog: () => void; // If you have a method to open the dialog
      // Add other methods or properties you need to access
    };
    const isDialogOpen = ref(false);
    const itemStore = useItemStore();
    const items = ref<Item[]>([]);
    const itemForm = ref() as Ref<ItemFormComponent | null>;
    const editableItem = ref({});
    const searchQuery = ref('');

    const openNewItemForm = () => {
      editableItem.value = {}; // Reset or set up a new item structure
      isDialogOpen.value = true;
    };

    const filteredItems = computed(() => {
      if (!searchQuery.value) {
        return items.value; // Return all items if search query is empty
      }
      return items.value.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    const columns: QTableColumn[] = [
      {
        name: 'name',
        required: true,
        label: 'Name',
        align: 'left',
        field: (row: Item) => row.name,
        sortable: true,
      },
      { name: 'price', label: 'Price', field: 'price', sortable: true },
      {
        name: 'category',
        label: 'Category',
        field: 'category',
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

    const fetchItems = async () => {
      await itemStore.fetchItems();
      items.value = itemStore.items;
    };

    const editItem = (item: Item) => {
      editableItem.value = item;
      isDialogOpen.value = true;
    };

    const updateItem = async (item: Item) => {
      // Call the store method to update the item
      await itemStore.updateItem(item);
      // Refresh items list or handle UI update here
    };

    const deleteItem = async (item: Item) => {
      if (typeof item.id === 'undefined') {
        Swal.fire('Error', 'Item ID is undefined.', 'error');
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
          if (typeof item.id === 'undefined') {
            Swal.fire('Error', 'Item ID is undefined.', 'error');
            return;
          } else {
            await itemStore.deleteItem(item.id);
            await itemStore.fetchItems();
            items.value = itemStore.items;
            Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
            // Refresh items list or handle UI update here
          }
        }
      });
    };

    watch(
      () => itemForm.value?.dialog,
      (newVal) => {
        if (newVal === false) {
          isDialogOpen.value = false;
        }
      }
    );

    onMounted(fetchItems);

    return {
      items,
      columns,
      itemForm,
      editableItem,
      isDialogOpen,
      searchQuery,
      filteredItems,
      openNewItemForm,
      editItem,
      updateItem,
      deleteItem,
      fetchItems,
    };
  },
};
</script>
