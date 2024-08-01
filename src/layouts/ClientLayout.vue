<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> Welcome To Jakarta Karaoke! </q-toolbar-title>

        <div>Powered By Galih @ 2024</div>
      </q-toolbar>
    </q-header>

    <!-- Sidebar -->
    <q-drawer show-if-above v-model="drawer" side="left" bordered>
      <q-item clickable v-ripple @click="selectMenu('clientCurrentOrder')">
        <q-item-section> Current Order </q-item-section>
      </q-item>
      <q-item
        :class="{ 'disabled-item': !isOrderExist }"
        :disable="!isOrderExist"
        clickable
        v-ripple
        @click="selectMenu('clientAddItem')"
      >
        <q-item-section> Pesan </q-item-section>
      </q-item>
    </q-drawer>

    <!-- Page Container -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useClientOrderStore } from 'src/stores/client-order-store';

export default {
  setup() {
    const drawer = ref(false);
    const router = useRouter();

    const clientOrder = useClientOrderStore();

    const isOrderExist = computed(() => {
      return !!clientOrder.orderId;
    });

    const toggleLeftDrawer = () => {
      drawer.value = !drawer.value;
    };

    const selectMenu = (menuItem: string) => {
      if (isOrderExist.value || menuItem !== 'clientAddItem') {
        router.push({ name: menuItem });
      }
    };

    return {
      drawer,
      toggleLeftDrawer,
      selectMenu,
      isOrderExist,
    };
  },
};
</script>

<style scoped>
.disabled-item {
  filter: grayscale(100%);
  pointer-events: none;
}
</style>
