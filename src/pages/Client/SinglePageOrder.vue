<template>
  <div
    style="
      background-image: url('https://img.freepik.com/free-vector/decorative-glowing-neon-frame_23-2149086116.jpg?t=st=1723285066~exp=1723288666~hmac=7c86691da6f9c3cab262a84c87128181c6d8ce60e233622b815e8a852e241e2a&w=826');
      background-size: cover;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    "
  >
    <q-toolbar
      elevated
      style="
        flex-shrink: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      "
    >
      <!-- Logo -->
      <q-img src="~assets/karaoke.svg" style="height: 15vh; width: 15vh" />

      <div>
        <!-- User Actions -->
        <div v-if="order">
          <q-btn
            flat
            dense
            round
            aria-label="Panggil Pelayan"
            size="xl"
            color="white"
            icon="person"
            @click="callWaitress"
          />
          <q-btn
            size="xl"
            flat
            dense
            round
            icon="shopping_cart"
            color="white"
            aria-label="View Order"
            @click="viewOrder"
          >
            <q-badge
              v-if="totalOrderQuantity > 0"
              :label="totalOrderQuantity"
              color="red"
              floating
              transparent
              style="top: 5px; right: 5px"
            />
          </q-btn>
          <!-- New Button to Show Invoice -->
          <q-btn
            size="xl"
            flat
            dense
            round
            icon="receipt"
            color="white"
            aria-label="View Invoice"
            @click="viewInvoice"
          />
        </div>
        <div v-else></div>
      </div>
    </q-toolbar>

    <!-- Content Area -->
    <div style="flex: 1; overflow-y: auto; padding: 1vh" v-if="order">
      <!-- Product Categories -->
      <div
        style="
          background-color: white;
          border-radius: 10px;
          padding: 5px;
          display: flex;
          justify-content: center;
          width: fit-content;
          margin: 0 auto;
        "
      >
        <q-tabs
          v-model="selectedCategory"
          class="text-center"
          align="center"
          active-color="white"
          indicator-color="white"
        >
          <q-tab
            v-for="category in categories"
            :key="category"
            :name="category"
            :label="category"
            class="full-width-tab"
            :style="
              selectedCategory === category
                ? 'background-color: #3A7CA5; color: white;'
                : ''
            "
          />
        </q-tabs>
      </div>

      <!-- Product List -->
      <div
        class="row q-mt-md q-gutter-md justify-center"
        style="height: calc(100vh - 60vh); overflow-y: auto"
      >
        <q-card
          v-for="item in filteredItems"
          :key="item.id"
          class="col-6 col-sm-4 col-md-3 col-lg-2"
          style="
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 90%;
          "
        >
          <q-img
            :src="item.imageUrl"
            :alt="item.name"
            fit="contain"
            style="height: 20vh; width: 100%"
          />
          <q-card-section>
            <div class="text-h6">{{ item.name }}</div>
            <div>{{ useCurrency(item.price) }}</div>
            <q-btn
              class="q-mt-md"
              label="Tambah Ke Keranjang"
              color="primary"
              @click="addToOrder(item)"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Message when order does not exist -->
    <div
      v-else
      style="
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1;
      "
    >
      <q-card
        style="background-color: white; padding: 20px; text-align: center"
      >
        <div class="text-h6">Sesi Karaoke Belum Aktif</div>
        <p>Silahkan hubungi pelayan.</p>
      </q-card>
    </div>

    <!-- View Order Modal -->
    <q-dialog v-model="isOrderDialogOpen" persistent>
      <q-card style="min-width: 50vw; max-width: 50vw">
        <q-card-section>
          <div class="text-h6">Keranjang Belanja</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-list>
            <q-item v-for="(quantity, itemId) in shoppingBag" :key="itemId">
              <q-item-section>{{ getItemById(itemId).name }}</q-item-section>
              <q-item-section>{{ quantity }}</q-item-section>
              <q-item-section>{{
                useCurrency(getItemById(itemId).price * quantity)
              }}</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn label="Checkout" color="primary" @click="checkout" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- View Invoice Modal -->
    <q-dialog v-model="isInvoiceDialogOpen">
      <q-card style="min-width: 50vw; max-width: 50vw">
        <q-card-section>
          <div class="text-h6">Tagihan</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <!-- Display Invoice Details Here -->
          <q-list v-if="order">
            <q-item v-for="item in order.itemSummary.items" :key="item.itemId">
              <q-item-section>{{ item.name }}</q-item-section>
              <q-item-section>{{ item.quantity }}</q-item-section>
              <q-item-section>{{
                useCurrency(item.price * item.quantity)
              }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <strong>Total:</strong>
              </q-item-section>
              <q-item-section />
              <q-item-section>{{
                useCurrency(order.itemSummary.totalPrices)
              }}</q-item-section>
            </q-item>
          </q-list>
          <div v-else>No order available. Please start an order first.</div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn label="Close Order" color="red" @click="closeOrder" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useClientOrderStore } from 'src/stores/client-order-store';
import { Item } from 'src/types/interfaces';
import { useCurrency } from 'src/utils/filters';
import { useRoute } from 'vue-router';
import Swal from 'sweetalert2';

export default {
  setup() {
    const clientOrderStore = useClientOrderStore();
    const items = ref<Item[]>([]);
    const categories = ref<string[]>([]);
    const selectedCategory = ref<string>('Category 1');
    const shoppingBag = ref<{ [key: string]: number }>({});
    const isOrderDialogOpen = ref(false);
    const isInvoiceDialogOpen = ref(false); // New state for Invoice Dialog

    const route = useRoute();
    const order = ref(null);

    const deviceId = route.params.deviceId as string;

    const fetchCurrentOrder = async () => {
      await clientOrderStore.fetchOrder(deviceId);
      order.value = clientOrderStore.getOrder;
    };

    onMounted(() => {
      fetchItems();
      fetchCurrentOrder();
    });

    const totalOrderQuantity = computed(() => {
      return Object.values(shoppingBag.value).reduce(
        (total, qty) => total + qty,
        0
      );
    });

    const fetchItems = async () => {
      await clientOrderStore.fetchItems();
      items.value = clientOrderStore.items;
      categories.value = [...new Set(items.value.map((item) => item.category))];
      selectedCategory.value = categories.value[0];
    };

    const filteredItems = computed(() => {
      return items.value.filter(
        (item) => item.category === selectedCategory.value
      );
    });

    const addToOrder = (item: Item) => {
      const quantity = shoppingBag.value[item.id] || 0;
      shoppingBag.value[item.id] = quantity + 1;
    };

    const viewOrder = () => {
      if (Object.keys(shoppingBag.value).length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Anda Belum Pilih Barang!',
          text: 'Silahkan Pilih Barang Dulu.',
        });
        return;
      }
      isOrderDialogOpen.value = true;
    };

    const viewInvoice = () => {
      isInvoiceDialogOpen.value = true;
    };

    const getItemById = (id: string | number) => {
      return (
        items.value.find((item) => item.id === id) || { name: '', price: 0 }
      );
    };

    const checkout = async () => {
      if (Object.keys(shoppingBag.value).length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'No Order Found',
          text: 'Your shopping cart is empty.',
        });
        return;
      }

      const itemDetails = Object.entries(shoppingBag.value).map(
        ([itemId, quantity]) => {
          const item = getItemById(itemId);
          return {
            itemId: item.id,
            name: item.name,
            price: item.price * quantity,
            quantity,
          };
        }
      );
      await clientOrderStore.addItemToOrder(itemDetails);
      Swal.fire({
        icon: 'info',
        title: 'Pesanan Sudah Diterima!',
        text: 'Pesanan sudah kami terima, mohon tunggu sebentar.',
      });
      fetchCurrentOrder();
      shoppingBag.value = {}; // Clear the shopping bag
      isOrderDialogOpen.value = false; // Close the dialog
    };

    const callWaitress = () => {
      Swal.fire({
        icon: 'info',
        title: 'Pelayan Dipanggil',
        text: 'Pelayan kami sudah dinotifikasi dan akan membantu anda segera.',
      });
    };

    const closeOrder = async () => {
      isInvoiceDialogOpen.value = false;
      if (order.value) {
        const result = await Swal.fire({
          title: 'Apakah anda yakin?',
          text: 'Apakah anda yakin untuk menyelesaikan sesi karaoke?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Ya, Selesaikan',
          cancelButtonText: 'Batal',
        });

        if (result.isConfirmed) {
          await clientOrderStore.closeOrder();
          Swal.fire({
            icon: 'success',
            title: 'Request Diterima',
            text: 'Kasir Sudah Menerima Notifikasi Untuk Menutup Tagihan',
          });
        }
      }
    };

    return {
      categories,
      selectedCategory,
      filteredItems,
      shoppingBag,
      isOrderDialogOpen,
      isInvoiceDialogOpen,
      addToOrder,
      viewOrder,
      viewInvoice,
      getItemById,
      checkout,
      callWaitress,
      closeOrder,
      useCurrency,
      totalOrderQuantity,
      order,
    };
  },
};
</script>

<style scoped>
.full-width-tab {
  text-align: center;
}
</style>
