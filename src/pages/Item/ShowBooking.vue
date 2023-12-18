<template>
  <q-page padding>
    <div class="flex justify-between row q-mb-md">
      <!-- Actions Section -->
      <div class="flex column q-mr-md" v-if="!isCommunity">
        <div class="text-h6 q-mb-md">Actions</div>
        <q-btn
          label="Create Booking"
          color="primary"
          @click="openNewBookingForm"
          class="q-mb-md buttonAction"
        />
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
      <template v-slot:body-cell-actions="props" v-if="!isCommunity">
        <q-td :props="props">
          <q-btn flat icon="edit" @click="editBooking(props.row)" />
          <q-btn flat icon="delete" @click="deleteBooking(props.row)" />
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props" v-else>
        <q-td :props="props">
          <q-btn flat icon="edit" @click="editBooking(props.row)" disable />
          <q-btn flat icon="delete" @click="deleteBooking(props.row)" disable />
        </q-td>
      </template>
    </q-table>

    <!-- Add the BookingForm component if you have one -->
    <booking-form
      ref="bookingForm"
      :booking="editableBooking"
      :isOpen="isDialogOpen"
      @save="updateBooking"
    />
  </q-page>
</template>

<script lang="ts">
import { ref, onMounted, Ref, watch, computed } from 'vue';
import { Booking } from 'src/types/interfaces'; // Update path as needed
import { QTableColumn } from 'quasar';
import Swal from 'sweetalert2';
import BookingForm from 'src/components/BookingComponent.vue'; // Update path as needed
import { useLiveData } from 'src/stores/live-data'; // Update path as needed
import formatDateFirestore from 'src/utils/firebaseDateFormatter';
import alasql from 'alasql';
import * as XLSX from 'xlsx';
import { rupiah } from 'src/utils/formatRupiah';
import { useUserStore } from 'src/stores/user-store';

export default {
  components: { BookingForm },
  setup() {
    type BookingFormComponent = {
      dialog: boolean;
      openDialog: () => void; // If you have a method to open the dialog
      // Add other methods or properties you need to access
    };

    const alasqlWithXLSX = alasql as any;
    alasqlWithXLSX.utils.global.XLSX = XLSX;

    const isDialogOpen = ref(false);
    const liveDataStore = useLiveData();
    const bookings = ref<Booking[]>([]);
    const bookingForm = ref() as Ref<BookingFormComponent | null>; // Adjust to your form component type
    const editableBooking = ref({});
    const searchQuery = ref('');
    const filterSelection = ref('SEMUA');
    const startDateFilter = ref('');
    const endDateFilter = ref('');
    const isCommunity = ref(true);

    const userStore = useUserStore();

    const openNewBookingForm = () => {
      console.log('open booking');
      editableBooking.value = {}; // Reset or set up a new booking structure
      isDialogOpen.value = true;
    };

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

      return result;
    });

    const columns: QTableColumn[] = [
      {
        name: 'code',
        required: true,
        label: 'Booking Code',
        align: 'left',
        field: 'code',
        sortable: true,
      },
      {
        name: 'email',
        label: 'Email',
        field: 'email',
        sortable: true,
      },
      {
        name: 'nomor HP',
        label: 'nomor HP',
        field: 'phoneNumber',
        sortable: true,
      },
      {
        name: 'lapangan',
        label: 'Lapangan',
        field: 'lapangan',
        sortable: true,
      },
      {
        name: 'harga',
        label: 'Harga',
        field: 'harga',
        format: (val) => rupiah(val),
        sortable: true,
      },
      {
        name: 'startTime',
        label: 'Start Time',
        field: 'startTime',
        format: (val) => formatDateFirestore(val),
        sortable: true,
      },
      {
        name: 'endTime',
        label: 'End Time',
        field: 'endTime',
        format: (val) => formatDateFirestore(val),
        sortable: true,
      },
      {
        name: 'actions',
        label: 'Actions',
        field: 'action',
        align: 'center',
        sortable: false,
      },
    ];

    const fetchBookings = async () => {
      await liveDataStore.fetchBookings();
      bookings.value = liveDataStore.bookings;
    };

    const editBooking = (booking: Booking) => {
      console.log('edit booking');
      console.log(booking);
      editableBooking.value = booking;
      isDialogOpen.value = true;
    };

    const updateBooking = async () => {
      await fetchBookings();
    };

    const deleteBooking = async (booking: Booking) => {
      if (typeof booking.id === 'undefined') {
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
          if (typeof booking.id === 'undefined') {
            Swal.fire('Error', 'Booking ID is undefined.', 'error');
            return;
          } else {
            await liveDataStore.deleteBooking(booking.id);
            Swal.fire('Deleted!', 'The booking has been deleted.', 'success');
            await fetchBookings();
          }
        }
      });
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
        Email: booking.email,
        'Phone Number': booking.phoneNumber,
        Lapangan: booking.lapangan,
        Harga: booking.harga,
        'Start Time': formatDateFirestore(booking.startTime),
        'End Time': formatDateFirestore(booking.endTime),
      }));

      alasql(
        'SELECT * INTO XLSX("LAPORAN BOOKING.xlsx",{headers:true}) FROM ?',
        [data]
      );
    }

    watch(
      () => bookingForm.value?.dialog,
      (newVal) => {
        if (newVal === false) {
          isDialogOpen.value = false;
        }
      }
    );

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
      bookingForm,
      editableBooking,
      isDialogOpen,
      searchQuery,
      filteredBookings,
      filterSelection,
      startDateFilter,
      endDateFilter,
      exportToExcel,
      getBadgeColor,
      openNewBookingForm,
      editBooking,
      updateBooking,
      deleteBooking,
    };
  },
};
</script>

<style></style>
