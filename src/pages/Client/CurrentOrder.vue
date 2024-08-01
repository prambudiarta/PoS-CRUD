<template>
  <q-page padding>
    <div class="q-gutter-md">
      <q-card v-if="order">
        <q-card-section>
          <div class="text-h6">Current Order Details</div>
        </q-card-section>

        <q-card-section>
          <div><strong>Order Started:</strong> {{ orderStarted }}</div>
          <div>
            <strong>Time Since Order Started:</strong>
            {{ timeSinceOrderStarted }}
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-h6">Pesanan :</div>
        </q-card-section>
        <q-card-section>
          <q-list>
            <q-item v-for="item in orderItems" :key="item.itemId">
              <q-item-section>{{ item.name }}</q-item-section>
              <q-item-section>{{ item.quantity }}</q-item-section>
              <q-item-section>{{ useCurrency(item.price) }}</q-item-section>
              <q-item-section>Complete</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Close Order" color="primary" @click="closeOrder" />
        </q-card-actions>
      </q-card>

      <q-card v-else>
        <q-card-section>
          <div class="text-h6">Device Inactive</div>
          <div>Please Open Bill To Start Order</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useClientOrderStore } from 'src/stores/client-order-store';
import { ItemDetail } from 'src/types/interfaces';
import { useCurrency } from 'src/utils/filters';
import Swal from 'sweetalert2';
import { useRoute } from 'vue-router';

export default {
  setup() {
    const clientOrderStore = useClientOrderStore();
    const order = ref(null);
    const orderStarted = ref('');
    const orderItems = ref<ItemDetail[]>([]);
    const timeSinceOrderStarted = ref('');
    const route = useRoute();

    const deviceId = route.params.deviceId as string;

    const fetchCurrentOrder = async () => {
      await clientOrderStore.fetchOrder(deviceId);
      order.value = clientOrderStore.getOrder; // Adjust based on your order status logic
      if (order.value) {
        orderStarted.value = new Date(
          order.value.startTime * 1000
        ).toLocaleString();
        orderItems.value = order.value.itemSummary.items;

        updateTimeSinceOrderStarted();
        setInterval(updateTimeSinceOrderStarted, 1000);
      }
    };

    const updateTimeSinceOrderStarted = () => {
      if (order.value) {
        const now = new Date().getTime();
        const startTime = order.value.startTime * 1000;
        const elapsedTime = now - startTime;

        const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
        const minutes = Math.floor(
          (elapsedTime % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);

        timeSinceOrderStarted.value = `${hours}h ${minutes}m ${seconds}s`;
      }
    };

    const closeOrder = async () => {
      if (order.value) {
        await clientOrderStore.closeOrder();
        Swal.fire({
          icon: 'success',
          title: 'Request Diterima',
          text: 'Bill akan segera di close oleh kasir',
        });
      }
    };

    onMounted(fetchCurrentOrder);

    return {
      orderStarted,
      orderItems,
      timeSinceOrderStarted,
      closeOrder,
      useCurrency,
      order,
    };
  },
};
</script>

<style scoped>
/* Add custom styles if necessary */
</style>
