<template>
  <q-layout>
    <q-drawer v-model="drawer" show-if-above bordered>
      <q-list>
        <q-item
          v-for="category in categories"
          :key="category.id"
          clickable
          @click="filterItems(category.category)"
        >
          <q-item-section avatar>
            <q-avatar>
              <img :src="category.imageUrl" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            {{ category.category }}
          </q-item-section>
        </q-item>

        <div>
          <!-- Button to show the checkout dialog -->
          <q-btn
            class="q-mt-md"
            color="accent"
            icon="shopping_cart"
            label="Checkout"
            @click="showCheckoutDialog = true"
          />
        </div>

        <!-- Button to show the current order -->
        <div>
          <q-btn
            class="q-mt-md"
            color="primary"
            icon="receipt"
            label="Current Order"
            @click="openCurrentOrderDialog"
          />
        </div>

        <div>
          <!-- Button to show the checkout dialog -->
          <q-btn
            class="q-mt-md"
            color="green"
            icon="task_alt"
            label="Close Order"
            @click="showCheckoutDialog = true"
          />
        </div>
      </q-list>
    </q-drawer>

    <!-- Current Order Dialog -->
    <q-dialog v-model="showCurrentOrderDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Current Order Details</div>
          <div v-if="currentOrder">
            <div><strong>Order ID:</strong> {{ currentOrder.orderId }}</div>
            <div><strong>Status:</strong> {{ currentOrder.status }}</div>
            <table v-if="currentOrder.itemSummary" class="q-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in currentOrder.itemSummary.items"
                  :key="item.itemId"
                >
                  <td>{{ item.name }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ item.price }}</td>
                </tr>
              </tbody>
            </table>

            <!-- Add more fields as necessary -->
          </div>
          <div v-else>No current order data available.</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" @click="showCurrentOrderDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Checkout Dialog -->
    <q-dialog v-model="showCheckoutDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirm Checkout</div>
          <div v-for="item in tempOrder" :key="item.id">
            {{ item.name }} - Quantity: {{ item.quantity }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="negative"
            @click="showCheckoutDialog = false"
          />
          <q-btn
            flat
            label="Confirm"
            color="positive"
            @click="confirmCheckout"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-page-container>
      <q-page>
        <div v-if="loading">Loading...</div>
        <div v-else>
          <div v-if="orderExists">
            <div
              class="q-pa-md"
              style="max-width: 300px"
              v-for="menuItem in filteredMenuItems"
              :key="menuItem.id"
            >
              <q-card>
                <q-card-section class="q-pa-none">
                  <q-img :src="menuItem.imageUrl" height="200px" />
                </q-card-section>

                <q-card-section>
                  <div class="text-h6">{{ menuItem.name }}</div>
                  <div class="text-subtitle2">{{ menuItem.category }}</div>
                  <div class="text-subtitle1">Price: {{ menuItem.price }}</div>

                  <!-- Quantity Counter -->
                  <div class="row items-center q-mt-md">
                    <q-btn
                      icon="remove"
                      @click="decrement(menuItem)"
                      dense
                      flat
                    />
                    <q-input
                      v-model.number="menuItem.quantity"
                      type="number"
                      min="1"
                      style="width: 50px"
                    />
                    <q-btn icon="add" @click="increment(menuItem)" dense flat />
                  </div>

                  <!-- Add to Cart Button -->
                  <q-btn
                    label="Add to Cart"
                    @click="addToCart(menuItem)"
                    class="full-width q-mt-sm"
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>
          <div v-else>Room Tidak Dibuka</div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useOrderStore } from 'src/stores/order-store';
import { useItemStore } from 'src/stores/item-store';
import { Item, Categories, Order, ItemDetail } from 'src/types/interfaces';

export default defineComponent({
  setup() {
    const route = useRoute();
    const loading = ref(true);
    const orderExists = ref(false);
    const menuItems = ref<Item[]>([]);
    const categories = ref<Categories[]>([]);
    const selectedCategoryId = ref('');
    const drawer = ref(false);
    const currentOrder = ref({} as Order);
    const tempOrder = ref<Item[]>([]);
    const showCheckoutDialog = ref(false);
    const showCurrentOrderDialog = ref(false);

    const orderStore = useOrderStore();
    const itemStore = useItemStore();

    // Fetch categories and items on mounted
    onMounted(async () => {
      await loadCategoriesAndItems();
    });

    // Watch for route changes to update the order
    watch(
      () => route.params.deviceId,
      async (deviceId) => {
        if (deviceId) await checkAndLoadOrder(deviceId as string);
      },
      { immediate: true }
    );

    // Computed property for filtered menu items
    const filteredMenuItems = computed(() => {
      return selectedCategoryId.value
        ? menuItems.value.filter(
            (item) => item.category === selectedCategoryId.value
          )
        : menuItems.value;
    });

    async function loadCategoriesAndItems() {
      await Promise.all([loadCategories(), loadMenuItems()]);
      loading.value = false;
    }

    async function loadCategories() {
      await itemStore.fetchCategories();
      categories.value = itemStore.categories;
    }

    async function loadMenuItems() {
      await orderStore.fetchItems();
      menuItems.value = orderStore.items;
    }

    async function checkAndLoadOrder(deviceId: string) {
      const response = await orderStore.checkOrderForRoom(deviceId);
      if (response && response.status === 'pending') {
        orderExists.value = true;
        currentOrder.value = response;
      }
    }

    function filterItems(categoryId: string) {
      selectedCategoryId.value = categoryId;
    }

    function openCurrentOrderDialog() {
      if (currentOrder.value && currentOrder.value.orderId) {
        showCurrentOrderDialog.value = true;
      } else {
        console.log('No current order data available.');
      }
    }

    function addToCart(menuItem: Item) {
      const itemIndex = tempOrder.value.findIndex(
        (item) => item.id === menuItem.id
      );
      if (itemIndex > -1) {
        tempOrder.value[itemIndex].quantity! = menuItem.quantity!;
      } else {
        tempOrder.value.push({ ...menuItem });
      }
      console.log('Item added to tempOrder:', menuItem);
    }

    async function confirmCheckout() {
      console.log('Checkout confirmed with items:', tempOrder.value);

      tempOrder.value.forEach((val) => {
        const itemToAdd = {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          itemId: val.id!,
          name: val.name,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          quantity: val.quantity!, // Default quantity, can be changed as needed
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          price: val.price * val.quantity!,
        };

        currentOrder.value.itemSummary?.items.push(itemToAdd);
      });

      await orderStore.updateOrderItem(
        currentOrder.value.orderId,
        currentOrder.value.itemSummary!.items
      );

      // Logic to add items in tempOrder to the actual order
      tempOrder.value = []; // Clear tempOrder after confirming
      showCheckoutDialog.value = false;
      // Update the actual order here
    }

    return {
      menuItems,
      categories,
      loading,
      orderExists,
      drawer,
      filteredMenuItems,
      filterItems,
      currentOrder,
      tempOrder,
      showCheckoutDialog,
      addToCart,
      confirmCheckout,
      showCurrentOrderDialog,
      openCurrentOrderDialog,
    };
  },

  methods: {
    increment(menuItem: Item) {
      if (!menuItem.quantity) menuItem.quantity = 0;
      menuItem.quantity++;
    },
    decrement(menuItem: Item) {
      if (menuItem.quantity && menuItem.quantity > 1) {
        menuItem.quantity--;
      }
    },
  },
});
</script>
