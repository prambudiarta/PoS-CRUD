<template>
  <q-page padding>
    <div class="flex justify-between q-mb-md">
      <q-btn
        label="Create Room"
        color="primary"
        @click="openNewCategoryForm"
        class="q-mr-md"
      />
      <q-input v-model="searchQuery" placeholder="Search Room" />
    </div>
    <q-table
      title="Room List"
      :rows="filteredCategory"
      :columns="columns"
      row-key="id"
    >
      <!-- Custom slot for edit button -->
      <template v-slot:body-cell-edit="props">
        <q-td :props="props">
          <!-- <q-btn flat icon="edit" @click="editCategory(props.row)" /> -->
          <q-btn flat icon="delete" @click="deleteCategory(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- Add the CategoryForm component -->
    <room-form
      ref="roomForm"
      :category="editableRoom"
      :isOpen="isDialogOpen"
      @save="updateCategory"
    />
  </q-page>
</template>

<script lang="ts">
import { ref, onMounted, Ref, watch, computed } from 'vue';
import { Room } from 'src/types/interfaces';
import { QTableColumn } from 'quasar';
import Swal from 'sweetalert2';
import RoomForm from 'src/components/RoomComponent.vue';
import { useDeviceStore } from 'src/stores/device-store';

export default {
  components: { RoomForm },
  setup() {
    type RoomFormComponent = {
      dialog: boolean;
      openDialog: () => void; // If you have a method to open the dialog
      // Add other methods or properties you need to access
    };
    const isDialogOpen = ref(false);
    const deviceStore = useDeviceStore();
    const rooms = ref<Room[]>([]);
    const roomForm = ref() as Ref<RoomFormComponent | null>;
    const editableRoom = ref({});
    const searchQuery = ref('');

    const openNewCategoryForm = () => {
      editableRoom.value = {}; // Reset or set up a new item structure
      isDialogOpen.value = true;
    };

    const filteredCategory = computed(() => {
      if (!searchQuery.value) {
        return rooms.value; // Return all items if search query is empty
      }
      return rooms.value.filter((room) =>
        room.description.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    const columns: QTableColumn[] = [
      {
        name: 'id',
        required: true,
        label: 'Devices Id',
        align: 'left',
        field: (row: Room) => row.id,
        sortable: true,
      },
      {
        name: 'description',
        label: 'Deskripsi',
        field: 'description',
        sortable: true,
      },
      { name: 'price', label: 'Harga per Jam', field: 'price', sortable: true },
      {
        name: 'edit',
        label: 'Action',
        field: 'editAction',
        align: 'center',
        sortable: false,
      },
      // Add more columns as needed
    ];

    const fetchRoom = async () => {
      await deviceStore.fetchRoom();
      rooms.value = deviceStore.rooms;
    };

    const editCategory = (room: Room) => {
      editableRoom.value = room;
      isDialogOpen.value = true;
    };

    const updateCategory = async (room: Room) => {
      // Call the store method to update the item
      await deviceStore.updateRoom(room);
      // Refresh items list or handle UI update here
    };

    const deleteCategory = async (room: Room) => {
      if (typeof room.id === 'undefined') {
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
          if (typeof room.id === 'undefined') {
            Swal.fire('Error', 'Category ID is undefined.', 'error');
            return;
          } else {
            await deviceStore.deleteRoom(room.id);
            await deviceStore.fetchRoom();
            rooms.value = deviceStore.rooms;
            Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
            // Refresh items list or handle UI update here
          }
        }
      });
    };

    watch(
      () => roomForm.value?.dialog,
      (newVal) => {
        if (newVal === false) {
          isDialogOpen.value = false;
        }
      }
    );

    onMounted(fetchRoom);

    return {
      rooms,
      columns,
      roomForm,
      editableRoom,
      isDialogOpen,
      searchQuery,
      filteredCategory,
      openNewCategoryForm,
      editCategory,
      updateCategory,
      deleteCategory,
      fetchRoom,
    };
  },
};
</script>
