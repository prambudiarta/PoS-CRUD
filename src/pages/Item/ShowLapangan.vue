<template>
  <q-page padding>
    <div class="flex justify-between q-mb-md">
      <q-btn
        label="Create Lapangan"
        color="primary"
        @click="openNewLapanganForm"
        class="q-mr-md"
      />
      <q-input v-model="searchQuery" placeholder="Search lapangan by nama" />
    </div>
    <q-table
      title="Lapangan List"
      :rows="filteredLapangan"
      :columns="columns"
      row-key="id"
    >
      <!-- Custom slot for actions -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat icon="edit" @click="editLapangan(props.row)" />
          <q-btn flat icon="delete" @click="deleteLapangan(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- Add the LapanganForm component if you have one -->
    <lapangan-form
      ref="lapanganForm"
      :lapangan="editableLapangan"
      :isOpen="isDialogOpen"
      @save="updateLapangan"
    />
  </q-page>
</template>

<script lang="ts">
import { ref, onMounted, Ref, watch, computed } from 'vue';
import { Item, Lapangan } from 'src/types/interfaces';
import { QTableColumn } from 'quasar';
import Swal from 'sweetalert2';
import LapanganForm from 'src/components/LapanganComponent.vue';
import { useLiveData } from 'src/stores/live-data';

export default {
  components: { LapanganForm },
  setup() {
    type LapanganFormComponent = {
      dialog: boolean;
      openDialog: () => void; // If you have a method to open the dialog
      // Add other methods or properties you need to access
    };
    const isDialogOpen = ref(false);
    const liveDataStore = useLiveData();
    const lapangan = ref<Lapangan[]>([]);
    const lapanganForm = ref() as Ref<LapanganFormComponent | null>; // Update to your form component type
    const editableLapangan = ref({});
    const searchQuery = ref('');

    const openNewLapanganForm = () => {
      editableLapangan.value = {}; // Reset or set up a new lapangan structure
      isDialogOpen.value = true;
    };

    const filteredLapangan = computed(() => {
      if (!searchQuery.value) {
        return lapangan.value;
      }
      return lapangan.value.filter((l) =>
        l.nama.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    const columns: QTableColumn[] = [
      {
        name: 'nama',
        required: true,
        label: 'Nama',
        align: 'left',
        field: 'nama',
        sortable: true,
      },
      {
        name: 'deskripsi',
        required: true,
        label: 'Deskripsi',
        align: 'left',
        field: 'deskripsi',
        sortable: true,
      },
      { name: 'harga', label: 'Harga', field: 'harga', sortable: true },
      {
        name: 'actions',
        label: 'Actions',
        field: 'action',
        align: 'center',
        sortable: false,
      },
    ];

    const fetchLapangan = async () => {
      await liveDataStore.fetchLapangan();
      lapangan.value = liveDataStore.lapangan;
    };

    // Define editLapangan, updateLapangan, deleteLapangan similarly to the corresponding item actions
    const deleteLapangan = async (lapangan: Lapangan) => {
      if (typeof lapangan.id === 'undefined') {
        Swal.fire('Error', 'Lapangan ID is undefined.', 'error');
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
          if (typeof lapangan.id === 'undefined') {
            Swal.fire('Error', 'Lapangan ID is undefined.', 'error');
            return;
          } else {
            await liveDataStore.deleteLapangan(lapangan.id);
            Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
            await fetchLapangan();
          }
        }
      });
    };

    const editLapangan = (lapangan: Lapangan) => {
      editableLapangan.value = lapangan;
      isDialogOpen.value = true;
    };

    const updateLapangan = async (lapangan: Lapangan) => {
      // Call the store method to update the item
      await liveDataStore.updateLapangan(lapangan);
      // Refresh items list or handle UI update here
    };

    watch(
      () => lapanganForm.value?.dialog,
      (newVal) => {
        if (newVal === false) {
          isDialogOpen.value = false;
        }
      }
    );

    onMounted(fetchLapangan);

    return {
      lapangan,
      columns,
      lapanganForm,
      editableLapangan,
      isDialogOpen,
      searchQuery,
      filteredLapangan,
      openNewLapanganForm,
      deleteLapangan,
      editLapangan,
      updateLapangan,
      // ... and other methods like editLapangan, updateLapangan, deleteLapangan
    };
  },
};
</script>
