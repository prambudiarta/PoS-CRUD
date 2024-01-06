<template>
  <q-page padding>
    <div class="flex justify-between row q-mb-md">
      <!-- Actions Section -->
      <div class="flex column q-mr-md">
        <div class="text-h6 q-mb-md">Actions</div>
        <q-btn
          label="Create New Order"
          color="primary"
          @click="openNewOrder"
          class="q-mb-md buttonAction"
        />
      </div>
    </div>

    <q-table title="Orders" :rows="orders" :columns="columns" row-key="orderId">
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
          <q-th auto-width>Action</q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td>
            <q-btn
              size="sm"
              color="accent"
              round
              dense
              @click="props.expand = !props.expand"
              :icon="props.expand ? 'remove' : 'add'"
            />
          </q-td>
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.value }}
          </q-td>
          <q-td>
            <!-- <q-btn flat icon="edit" @click="editPrinter(props.row)" /> -->
            <q-btn flat icon="print" @click="openPrintOrder(props.row)" />
            <q-btn
              flat
              icon="task_alt"
              @click="closeOrder(props.row)"
              v-if="props.row.status !== 'completed'"
            />
          </q-td>
        </q-tr>
        <q-tr v-if="props.row.itemSummary" v-show="props.expand" :props="props">
          <q-td :colspan="props.cols.length + 1">
            <div class="text-left">
              <strong>Order:</strong>
              <table class="q-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in props.row.itemSummary.items"
                    :key="item.itemId"
                  >
                    <td>{{ item.name }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ item.price }}</td>
                  </tr>
                </tbody>
              </table>
              <div>
                <strong>Total Price:</strong>
                {{ props.row.itemSummary.totalPrices }}
              </div>
              <div>
                <strong>Total Items:</strong>
                {{ props.row.itemSummary.totalItem }}
              </div>
            </div>
            <div>
              <q-btn
                label="Add Item"
                color="primary"
                v-if="!props.row.endTime"
                @click="openManageItemsDialog(props.row)"
              />
            </div>
          </q-td>
        </q-tr>
        <q-tr v-else v-show="props.expand">
          <q-td colspan="100%">
            <q-btn
              v-if="!props.row.endTime"
              label="Add Item"
              color="primary"
              @click="openManageItemsDialog(props.row)"
            />
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>

  <!-- New Order Dialog -->
  <q-dialog v-model="newOrderDialog" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-space />
        <q-btn icon="close" flat round @click="newOrderDialog = false" />
      </q-card-section>

      <q-card-section>
        <div class="text-h6" style="margin-bottom: 20px">Select a Room</div>
        <q-list>
          <q-item
            v-for="room in rooms"
            :key="room.id"
            clickable
            :class="{ 'selected-room': selectedRoom === room }"
            @click="selectRoom(room)"
          >
            <q-item-section>{{ room.description }}</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="negative"
          @click="newOrderDialog = false"
        />
        <q-btn
          flat
          label="Create Order"
          color="primary"
          @click="createOrder"
          :disabled="!selectedRoom"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Printer Dialog -->
  <q-dialog v-model="openPrintDialog" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-space />
        <q-btn icon="close" flat round @click="openPrintDialog = false" />
      </q-card-section>

      <q-card-section>
        <div class="text-h6" style="margin-bottom: 20px">Select Printer</div>
        <q-list>
          <q-item
            v-for="print in printer"
            :key="print.id"
            clickable
            :class="{ 'selected-printer': selectedPrinter === print }"
            @click="selectPrinter(print)"
          >
            <q-item-section>{{ print.description }}</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="negative"
          @click="openPrintDialog = false"
        />
        <q-btn
          flat
          label="Print"
          color="primary"
          @click="printStruck"
          :disabled="!selectedRoom"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Item Management Dialog -->
  <q-dialog v-model="manageItemsDialog">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">Manage Items</div>
        <q-space />
        <q-btn icon="close" flat round @click="closeManageItemsDialog" />
      </q-card-section>

      <q-card-section>
        <!-- Item Management Form -->
        <div>
          <q-select
            v-model="selectedItem"
            label="Select Item"
            :options="items"
            option-value="id"
            option-label="name"
            class="q-mb-md"
            placeholder="Choose an item"
          />
          <q-input
            v-if="selectedItem"
            type="number"
            v-model="selectedItem.quantity"
            label="Quantity"
            class="q-mb-md"
          />
          <q-btn label="Add Item" @click="addItemToOrder" color="primary" />
        </div>

        <!-- List of Current Items -->
        <div v-if="currentOrderItems.length > 0" class="q-mt-md">
          <div class="text-subtitle2">Current Items</div>
          <q-list bordered>
            <q-item v-for="(item, index) in currentOrderItems" :key="index">
              <q-item-section>
                {{ item.name }} - {{ item.quantity }} - Rp. {{ item.price }}
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Update" @click="updateItemOrder" />
        <q-btn flat label="Close" @click="closeManageItemsDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useOrderStore } from 'src/stores/order-store'; // Adjust the path as necessary
import { Order } from 'src/types/interfaces';
import { formatTimestamp } from 'src/utils/firebaseDateFormatter';
import Swal from 'sweetalert2';
import { Printer, Room, ItemDetail, Item } from 'src/types/interfaces';
import { useDeviceStore } from 'src/stores/device-store';

export default defineComponent({
  setup() {
    const orderStore = useOrderStore();
    const deviceStore = useDeviceStore();
    const orders = ref<Order[]>([]);
    const expanded: Ref<string[]> = ref([]);

    const newOrderDialog = ref(false);
    const rooms = ref<Room[]>([]); // This will hold the room data
    const selectedRoom = ref({} as Room); // This will hold the selected room

    const items = ref<Item[]>([]);
    const manageItemsDialog = ref(false);
    const currentOrder = ref({} as Order);
    const currentOrderItems = ref([] as ItemDetail[]);
    const selectedItem = ref<Item | null>(null);

    const openPrintDialog = ref(false);
    const printer = ref<Printer[]>([]);
    const selectedPrinter = ref({} as Printer); // This will hold the selected room

    const openPrintOrder = async (order: Order) => {
      // Fetch rooms from Firebase
      await deviceStore.fetchPrinter();
      printer.value = deviceStore.printers;
      currentOrder.value = order;
      // Open the dialog
      openPrintDialog.value = true;
    };

    const openManageItemsDialog = async (order: Order) => {
      currentOrder.value = order;
      await orderStore.fetchItems();
      items.value = orderStore.items;

      if (order.itemSummary) {
        currentOrderItems.value = order.itemSummary.items;
      }

      manageItemsDialog.value = true;
    };

    const updateItemOrder = async () => {
      await orderStore.updateOrderItem(
        currentOrder.value.orderId,
        currentOrderItems.value
      );

      window.location.reload();
    };

    const addItemToOrder = () => {
      if (selectedItem.value) {
        const itemToAdd = {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          itemId: selectedItem.value.id!,
          name: selectedItem.value.name,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          quantity: selectedItem.value.quantity!, // Default quantity, can be changed as needed
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          price: selectedItem.value.price * selectedItem.value.quantity!,
        };
        console.log(itemToAdd);
        currentOrderItems.value.push(itemToAdd);
        selectedItem.value = null; // Reset the selection
      }
    };

    const closeManageItemsDialog = () => {
      manageItemsDialog.value = false;
      currentOrder.value = {} as Order;
    };

    const openNewOrder = async () => {
      // Fetch rooms from Firebase
      await deviceStore.fetchRoom();
      rooms.value = deviceStore.rooms.filter((room) => room.isAvailable);
      // Open the dialog
      newOrderDialog.value = true;
    };

    const selectRoom = (room: Room) => {
      selectedRoom.value = room;
      // You can do more things here, like setting up a new order object
    };

    const createOrder = async () => {
      if (selectedRoom.value) {
        // Logic to create a new order with the selected room
        await orderStore.createNeworder(selectedRoom.value);
        await orderStore.fetchOrders();
        orders.value = orderStore.orders;
        Swal.fire('Success', 'Create Order Sukses!', 'success');
        // Add order to Firebase and then close the dialog
        newOrderDialog.value = false;
      }
    };

    // Define the columns for QTable

    const columns = [
      {
        name: 'orderId',
        align: 'left',
        label: 'Order ID',
        field: 'orderId',
        sortable: true,
      },
      {
        name: 'deviceId',
        align: 'left',
        label: 'Device ID',
        field: 'deviceId',
        sortable: true,
      },
      {
        name: 'startTime',
        align: 'left',
        label: 'Start Time',
        field: (row: { startTime: number }) => formatTimestamp(row.startTime),
        sortable: true,
      },
      {
        name: 'endTime',
        align: 'left',
        label: 'End Time',
        field: (row: { endTime: number }) => formatTimestamp(row.endTime),
        sortable: true,
      },
      {
        name: 'grandTotalPrice',
        align: 'left',
        label: 'Total Price',
        field: 'grandTotalPrice',
        sortable: true,
      },
      {
        name: 'status',
        align: 'left',
        label: 'Status',
        field: 'status',
        sortable: true,
      },
    ];

    const fetchOrders = async () => {
      // Fetch orders from your store or API
      await orderStore.fetchOrders();
      orders.value = orderStore.orders;
      console.log(orders.value);
    };

    const selectPrinter = (printer: Printer) => {
      selectedPrinter.value = printer;
      // You can do more things here, like setting up a new order object
    };

    const printStruck = async () => {
      try {
        const simpleOrder = JSON.parse(JSON.stringify(currentOrder.value));
        console.log(simpleOrder);
        window.electronAPI.sendPrintOrder(
          selectedPrinter.value.id,
          simpleOrder
        );
      } catch (e) {
        console.log(e);
      }
    };

    const closeOrder = async (order: Order) => {
      const result = await Swal.fire({
        title: `Order ${order.orderId}`,
        text: 'Apakah Anda Close Order?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Close Order',
        cancelButtonText: 'Batal',
      });

      // Check if user confirmed
      if (result.isConfirmed) {
        try {
          await orderStore.closeOrder(order);
          await orderStore.fetchOrders();
          orders.value = orderStore.orders;
          Swal.fire('Success', 'Close Order Sukses!', 'success');
        } catch (error) {
          console.error('Error close order:', error);
          Swal.fire('Error', 'Ada Kendala Saat Close Order.', 'error');
        }
      }
    };

    onMounted(fetchOrders);

    return {
      orders,
      columns,
      expanded,
      openNewOrder,
      closeOrder,
      fetchOrders,
      printStruck,
      newOrderDialog,
      rooms,
      selectedRoom,
      selectRoom,
      createOrder,
      manageItemsDialog,
      currentOrder,
      currentOrderItems,
      selectedItem,
      items,
      openManageItemsDialog,
      addItemToOrder,
      closeManageItemsDialog,
      updateItemOrder,
      printer,
      selectedPrinter,
      openPrintDialog,
      openPrintOrder,
      selectPrinter,
    };
  },
});
</script>

<style>
.selected-room {
  background-color: #e0e0e0; /* Choose a highlight color that fits your design */
}

.selected-printer {
  background-color: #e0e0e0; /* Choose a highlight color that fits your design */
}
</style>
