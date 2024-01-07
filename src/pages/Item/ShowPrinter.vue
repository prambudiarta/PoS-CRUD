<template>
  <q-page padding>
    <div class="flex justify-between q-mb-md">
      <q-btn
        label="Create Printer"
        color="primary"
        @click="openNewCategoryForm"
        class="q-mr-md"
      />
      <q-input v-model="searchQuery" placeholder="Search Printer" />
    </div>
    <q-table
      title="Printer List"
      :rows="filteredCategory"
      :columns="columns"
      row-key="id"
    >
      <!-- Custom slot for edit button -->
      <template v-slot:body-cell-edit="props">
        <q-td :props="props">
          <!-- <q-btn flat icon="edit" @click="editPrinter(props.row)" /> -->
          <q-btn flat icon="print" @click="testPrinter(props.row.id)" />
          <q-btn flat icon="delete" @click="deletePrinter(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- Add the CategoryForm component -->
    <printer-form
      ref="printerForm"
      :category="editablePrinter"
      :isOpen="isDialogOpen"
      @save="fetchPrinter()"
    />
  </q-page>
</template>

<script lang="ts">
import { ref, onMounted, Ref, watch, computed } from 'vue';
import { Printer } from 'src/types/interfaces';
import { QTableColumn } from 'quasar';
import Swal from 'sweetalert2';
import PrinterForm from 'src/components/PrinterComponent.vue';
import { useDeviceStore } from 'src/stores/device-store';

export default {
  components: { PrinterForm },
  setup() {
    type PrinterFormComponent = {
      dialog: boolean;
      openDialog: () => void; // If you have a method to open the dialog
      // Add other methods or properties you need to access
    };
    const isDialogOpen = ref(false);
    const deviceStore = useDeviceStore();
    const printers = ref<Printer[]>([]);
    const printerForm = ref() as Ref<PrinterFormComponent | null>;
    const editablePrinter = ref({});
    const searchQuery = ref('');

    const openNewCategoryForm = () => {
      editablePrinter.value = {}; // Reset or set up a new item structure
      isDialogOpen.value = true;
    };

    const filteredCategory = computed(() => {
      if (!searchQuery.value) {
        return printers.value; // Return all items if search query is empty
      }
      return printers.value.filter((room) =>
        room.description.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    const columns: QTableColumn[] = [
      {
        name: 'id',
        required: true,
        label: 'Printer IP',
        align: 'left',
        field: (row: Printer) => row.id,
        sortable: true,
      },
      {
        name: 'description',
        label: 'Deskripsi',
        field: 'description',
        sortable: true,
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

    const fetchPrinter = async () => {
      await deviceStore.fetchPrinter();
      printers.value = deviceStore.printers;
    };

    const testPrinter = async (printerId: string) => {
      try {
        console.log('testprint');
        window.electronAPI.sendPrintTest(printerId);
      } catch (e) {
        console.log(e);
      }
    };

    const editCategory = (printer: Printer) => {
      editablePrinter.value = printer;
      isDialogOpen.value = true;
    };

    const updatePrinter = async (printer: Printer) => {
      // Call the store method to update the item
      await deviceStore.updatePrinter(printer);
      // Refresh items list or handle UI update here
    };

    const deletePrinter = async (printer: Printer) => {
      if (typeof printer.id === 'undefined') {
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
          if (typeof printer.id === 'undefined') {
            Swal.fire('Error', 'Category ID is undefined.', 'error');
            return;
          } else {
            await deviceStore.deletePrinter(printer.id);
            await deviceStore.fetchPrinter();
            printers.value = deviceStore.printers;
            Swal.fire('Deleted!', 'Your Printer has been deleted.', 'success');
            // Refresh items list or handle UI update here
          }
        }
      });
    };

    watch(
      () => printerForm.value?.dialog,
      (newVal) => {
        if (newVal === false) {
          isDialogOpen.value = false;
        }
      }
    );

    onMounted(fetchPrinter);

    return {
      printers,
      columns,
      printerForm,
      editablePrinter,
      isDialogOpen,
      searchQuery,
      filteredCategory,
      testPrinter,
      openNewCategoryForm,
      editCategory,
      updatePrinter,
      deletePrinter,
      fetchPrinter,
    };
  },
};
</script>
