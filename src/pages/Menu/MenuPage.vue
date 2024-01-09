<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <div v-if="loading">Loading...</div>
        <div v-else>
          <div v-if="orderExists">
            <!-- Display menu items here -->
            <div v-for="menuItem in menuItems" :key="menuItem.id">
              {{ menuItem.category }} - {{ menuItem.name }} -
              {{ menuItem.price }}
            </div>
          </div>
          <div v-else>Order Tidak Dibuka</div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useOrderStore } from 'src/stores/order-store';
import { Item } from 'src/types/interfaces';

export default defineComponent({
  setup() {
    const route = useRoute();
    const loading = ref(true);
    const orderExists = ref(false);
    const menuItems = ref<Item[]>([]);
    const orderStore = useOrderStore();

    const loadMenuItems = async () => {
      await orderStore.fetchItems();
      menuItems.value = orderStore.items;
    };

    const checkAndLoadOrder = async (deviceId: string) => {
      const response = await orderStore.checkOrderForRoom(deviceId);
      if (response && response.status === 'pending') {
        orderExists.value = true;
        await loadMenuItems();
      }
    };

    onMounted(async () => {
      const deviceId = route.params.deviceId as string;
      try {
        await checkAndLoadOrder(deviceId);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        loading.value = false;
      }
    });

    return {
      menuItems,
      loading,
      orderExists,
    };
  },
});
</script>
