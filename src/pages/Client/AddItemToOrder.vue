<template>
  <q-page padding>
    <div class="q-gutter-md">
      <q-input v-model="searchQuery" placeholder="Search items by name..." />

      <q-select
        v-model="selectedCategory"
        :options="categories"
        label="Filter by category"
        emit-value
        map-options
        class="q-mt-md"
      />

      <q-btn
        class="q-mt-md"
        label="Clear Filters"
        color="secondary"
        @click="clearFilters"
      />

      <q-btn
        class="q-mt-md"
        label="Checkout"
        color="green"
        @click="openShoppingBag"
      >
        <q-icon name="shopping_cart" class="q-mr-xs" />
      </q-btn>

      <q-btn
        class="q-mt-md"
        label="Reset Keranjang"
        color="red"
        @click="clearOrder"
      />

      <div class="row q-mt-md q-gutter-md">
        <q-card
          v-for="item in filteredItems"
          :key="item.id"
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <q-img
            :src="item.imageUrl"
            :alt="item.name"
            height="300px"
            style="object-fit: contain; width: 100%"
          />
          <q-card-section>
            <div class="text-h6">{{ item.name }}</div>
            <div>{{ item.category }}</div>
            <div>{{ useCurrency(item.price) }}</div>
            <div class="row items-center q-mt-md">
              <q-btn
                flat
                round
                dense
                icon="remove"
                @click="decreaseQuantity(item)"
              />
              <q-input
                v-model.number="itemQuantities[item.id]"
                type="number"
                min="0"
                readonly
                class="q-ma-sm quantity-input"
              />
              <q-btn
                flat
                round
                dense
                icon="add"
                @click="increaseQuantity(item)"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="isShoppingBagOpen" persistent>
      <q-card style="min-width: 20vw; max-width: 20vw">
        <q-card-section>
          <div class="text-h6">Checkout</div>
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
  </q-page>
</template>

<script lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useClientOrderStore } from 'src/stores/client-order-store';
import { Item } from 'src/types/interfaces';
import { useCurrency } from 'src/utils/filters';
import Swal from 'sweetalert2';

export default {
  setup() {
    const clientOrderStore = useClientOrderStore();
    const items = ref<Item[]>([]);
    const categories = ref<string[]>([]);
    const searchQuery = ref('');
    const selectedCategory = ref<string | null>(null);
    const itemQuantities = ref<{ [key: string]: number }>({});
    const shoppingBag = ref<{ [key: string]: number }>({});
    const isShoppingBagOpen = ref(false);

    const fetchItems = async () => {
      await clientOrderStore.fetchItems();
      items.value = clientOrderStore.items;
      categories.value = [...new Set(items.value.map((item) => item.category))];
    };

    onMounted(fetchItems);

    const filteredItems = computed(() => {
      let filtered = items.value;

      if (searchQuery.value) {
        filtered = filtered.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
      }

      if (selectedCategory.value) {
        filtered = filtered.filter(
          (item) => item.category === selectedCategory.value
        );
      }

      return filtered;
    });

    const addToBag = (item: Item) => {
      const quantity = itemQuantities.value[item.id] || 0;
      if (quantity > 0) {
        shoppingBag.value[item.id] = quantity;
      }
    };

    const increaseQuantity = (item: Item) => {
      if (!itemQuantities.value[item.id]) {
        itemQuantities.value[item.id] = 0;
      }
      itemQuantities.value[item.id]++;
      addToBag(item);
    };

    const decreaseQuantity = (item: Item) => {
      if (itemQuantities.value[item.id] > 0) {
        itemQuantities.value[item.id]--;
        if (itemQuantities.value[item.id] === 0) {
          delete shoppingBag.value[item.id];
        } else {
          shoppingBag.value[item.id] = itemQuantities.value[item.id];
        }
      }
    };

    const openShoppingBag = () => {
      if (Object.keys(shoppingBag.value).length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'No Order Found',
          text: 'Your shopping cart is empty.',
        });
        return;
      }
      isShoppingBagOpen.value = true;
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
      shoppingBag.value = {}; // Clear the shopping bag
      isShoppingBagOpen.value = false; // Close the dialog
    };

    const clearFilters = () => {
      searchQuery.value = '';
      selectedCategory.value = null;
    };

    const clearOrder = () => {
      shoppingBag.value = {};
      itemQuantities.value = {};
    };

    return {
      searchQuery,
      selectedCategory,
      categories,
      filteredItems,
      itemQuantities,
      shoppingBag,
      isShoppingBagOpen,
      addToBag,
      increaseQuantity,
      decreaseQuantity,
      openShoppingBag,
      getItemById,
      checkout,
      clearFilters,
      clearOrder,
      useCurrency,
    };
  },
};
</script>

<style scoped>
.quantity-input {
  width: 30px;
  font-size: 24px;
  text-align: center;
}
</style>
