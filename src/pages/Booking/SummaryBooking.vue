<template>
  <q-page padding>
    <div class="flex justify-between row q-mb-md">
      <!-- Actions Section -->
      <div class="flex column q-mr-md" v-if="!isCommunity">
        <div class="text-h6 q-mb-md">Actions</div>
        <q-btn
          label="Download"
          @click="exportToExcel"
          class="buttonAction downloadButton"
        />
      </div>

      <!-- Filters Section -->
      <div class="flex column">
        <div class="text-h6 q-mb-md">Filters</div>
        <div class="flex row q-mb-md">
          <div class="flex column q-mr-md">
            <div class="text-subtitle2">Start Date</div>
            <q-date v-model="startDateFilter" mask="YYYY-MM-DD" />
          </div>
          <div class="flex column q-mr-md">
            <div class="text-subtitle2">End Date</div>
            <q-date v-model="endDateFilter" mask="YYYY-MM-DD" />
          </div>
        </div>
        <div class="flex row q-mb-md">
          <q-select
            v-model="filterSelection"
            :options="['SEMUA', 'SELESAI', 'BERJALAN', 'AKAN DATANG']"
            label="Filter Bookings"
            style="width: 200px"
            class="q-mr-md"
          />
          <q-input
            v-model="searchQuery"
            placeholder="Booking Code"
            style="width: 200px"
          />
        </div>
      </div>
    </div>
    <q-table
      title="Booking List"
      :rows="filteredBookings"
      :columns="columns"
      row-key="id"
    >
      <!-- Custom slot for code -->
      <template v-slot:body-cell-code="props">
        <q-td :props="props">
          <div>
            <q-badge :color="getBadgeColor(props.row)" :label="props.value" />
          </div>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script lang="ts">
import { ref, onMounted, Ref, watch, computed, defineComponent } from 'vue';
import { Booking, IBooking } from 'src/types/interfaces'; // Update path as needed
import { QTableColumn } from 'quasar';
import Swal from 'sweetalert2';
import { useLiveData } from 'src/stores/live-data'; // Update path as needed
import formatDateFirestore from 'src/utils/firebaseDateFormatter';
import alasql from 'alasql';
import * as XLSX from 'xlsx';
import { rupiah } from 'src/utils/formatRupiah';
import { useUserStore } from 'src/stores/user-store';

export default defineComponent({
  setup() {
    const alasqlWithXLSX = alasql as any;
    alasqlWithXLSX.utils.global.XLSX = XLSX;

    const isDialogOpen = ref(false);
    const liveDataStore = useLiveData();
    const bookings = ref<IBooking[]>([]);
    const editableBooking = ref({});
    const searchQuery = ref('');
    const filterSelection = ref('SEMUA');
    const startDateFilter = ref('');
    const endDateFilter = ref('');
    const isCommunity = ref(true);

    const userStore = useUserStore();

    const filteredBookings = computed(() => {
      const now = new Date();

      // First filter based on the search query
      let result = bookings.value.filter((booking) => {
        return booking.code
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase());
      });

      // Then filter based on the time status
      result = result.filter((booking) => {
        const startTime = new Date(booking.startTime);
        const endTime = new Date(booking.endTime);

        switch (filterSelection.value) {
          case 'SELESAI':
            return endTime < now;
          case 'BERJALAN':
            return startTime <= now && now <= endTime;
          case 'AKAN DATANG':
            return startTime > now;
          case 'SEMUA':
          default:
            return true;
        }
      });

      if (startDateFilter.value) {
        const startDate = new Date(startDateFilter.value);
        result = result.filter((booking) => {
          const bookingStartDate = new Date(booking.startTime);
          return bookingStartDate >= startDate;
        });
      }

      // Filter by end date
      if (endDateFilter.value) {
        const endDate = new Date(endDateFilter.value);
        result = result.filter((booking) => {
          const bookingEndDate = new Date(booking.endTime);
          return bookingEndDate <= endDate;
        });
      }

      return result;
    });

    const columns: QTableColumn[] = [
      {
        name: 'code',
        required: true,
        label: 'Booking Code',
        align: 'left',
        field: (row) => row.code,
        sortable: true,
      },
      {
        name: 'package',
        label: 'Package',
        field: (row) => row.package.packageName,
        sortable: true,
      },
      {
        name: 'sku',
        label: 'SKU',
        field: (row) => row.package.sku,
        sortable: true,
      },
      {
        name: 'email',
        label: 'Email',
        field: (row) => row.user.email,
        sortable: true,
      },
      {
        name: 'lapangan',
        label: 'Lapangan',
        field: (row) => row.field.fieldName, // Accessing nested data
        sortable: true,
      },
      {
        name: 'olahraga',
        label: 'Olahraga',
        field: (row) => row.sport.sportName, // Accessing nested data
        sortable: true,
      },
      {
        name: 'startTime',
        label: 'Start Time',
        field: (row) => row.startTime,
        sortable: true,
      },
      {
        name: 'endTime',
        label: 'End Time',
        field: (row) => row.endTime,
        sortable: true,
      },
    ];

    const fetchBookings = async () => {
      await liveDataStore.fetchNewBookings();
      bookings.value = liveDataStore.newBooking;
      console.log(bookings.value);
    };

    const exportToExcel = async () => {
      if (
        filterSelection.value !== 'SEMUA' ||
        startDateFilter.value ||
        endDateFilter.value ||
        searchQuery.value
      ) {
        downloadData();
      } else {
        const result = await Swal.fire({
          title: 'Konfirmasi',
          text: 'Apakah Anda Ingin Download Tanpa Filter?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Ya',
          cancelButtonText: 'Batal',
        });
        if (result.isConfirmed) {
          return downloadData();
        }
      }
    };

    function downloadData() {
      const data = filteredBookings.value.map((booking) => ({
        Code: booking.code,
        Package: booking.package.packageName,
        SKU: booking.package.sku,
        Email: booking.user.email,
        Lapangan: booking.field.fieldName,
        Harga: booking.package.price,
        Olahraga: booking.sport.sportName,
        'Start Time': booking.startTime,
        'End Time': booking.endTime,
      }));

      alasql(
        'SELECT * INTO XLSX("LAPORAN BOOKING.xlsx",{headers:true}) FROM ?',
        [data]
      );
    }

    onMounted(async () => {
      await liveDataStore.fetchLapangan();
      if (userStore.currentUser.role !== 'Community') {
        isCommunity.value = false;
      }
      fetchBookings();
    });

    const getBadgeColor = (booking: Booking) => {
      if (new Date(booking.endTime) < new Date()) {
        return 'red'; // SELESAI
      } else if (new Date(booking.startTime) > new Date()) {
        return 'blue'; // AKAN DATANG
      } else {
        return 'green'; // BERJALAN
      }
    };

    return {
      isCommunity,
      bookings,
      columns,
      editableBooking,
      isDialogOpen,
      searchQuery,
      filteredBookings,
      filterSelection,
      startDateFilter,
      endDateFilter,
      exportToExcel,
      getBadgeColor,
    };
  },
});
</script>

<style></style>
