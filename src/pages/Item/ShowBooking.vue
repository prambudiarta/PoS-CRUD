<template>
  <q-page padding>
    <div class="flex justify-between q-mb-md">
      <q-btn
        label="Create Booking"
        color="primary"
        @click="openNewBookingForm"
        class="q-mr-md"
      />
      <q-input v-model="searchQuery" placeholder="Search bookings by code" />
    </div>
    <q-table
      title="Booking List"
      :rows="filteredBookings"
      :columns="columns"
      row-key="id"
    >
      <!-- Custom slot for actions -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat icon="edit" @click="editBooking(props.row)" />
          <q-btn flat icon="delete" @click="deleteBooking(props.row)" />
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

export default {
  components: { BookingForm },
  setup() {
    type BookingFormComponent = {
      dialog: boolean;
      openDialog: () => void; // If you have a method to open the dialog
      // Add other methods or properties you need to access
    };

    const isDialogOpen = ref(false);
    const liveDataStore = useLiveData();
    const bookings = ref<Booking[]>([]);
    const bookingForm = ref() as Ref<BookingFormComponent | null>; // Adjust to your form component type
    const editableBooking = ref({});
    const searchQuery = ref('');

    const openNewBookingForm = () => {
      console.log('open booking');
      editableBooking.value = {}; // Reset or set up a new booking structure
      isDialogOpen.value = true;
    };

    const filteredBookings = computed(() => {
      if (!searchQuery.value) {
        return bookings.value;
      }
      return bookings.value.filter((booking) =>
        booking.code.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    const columns: QTableColumn[] = [
      {
        name: 'code',
        required: true,
        label: 'Code',
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

    const updateBooking = async (booking: Booking) => {
      await liveDataStore.updateBooking(booking);
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

    watch(
      () => bookingForm.value?.dialog,
      (newVal) => {
        if (newVal === false) {
          isDialogOpen.value = false;
        }
      }
    );

    onMounted(fetchBookings);

    return {
      bookings,
      columns,
      bookingForm,
      editableBooking,
      isDialogOpen,
      searchQuery,
      filteredBookings,
      openNewBookingForm,
      editBooking,
      updateBooking,
      deleteBooking,
    };
  },
};
</script>

<style>
/* Add any specific styles for your booking page here */
</style>
