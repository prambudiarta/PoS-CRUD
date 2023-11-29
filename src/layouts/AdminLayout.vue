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

        <q-toolbar-title> Reservasi Lapangan </q-toolbar-title>

        <div>Quasar v{{ quasarVersion }}</div>
      </q-toolbar>
    </q-header>

    <!-- Sidebar -->
    <q-drawer show-if-above v-model="drawer" side="left" bordered>
      <q-list>
        <!-- Item Menu -->
        <q-item clickable v-ripple @click="toggleItemMenu">
          <q-item-section>Lapangan</q-item-section>
          <q-item-section side>
            <q-icon :name="itemMenuExpanded ? 'expand_less' : 'expand_more'" />
          </q-item-section>
        </q-item>
        <q-separator v-if="itemMenuExpanded" />
        <q-item
          v-if="itemMenuExpanded"
          clickable
          v-ripple
          @click="selectMenu('LapanganShow')"
          >Show Lapangan</q-item
        >

        <!-- Order Menu -->
        <q-item clickable v-ripple @click="toggleOrderMenu">
          <q-item-section>Booking</q-item-section>
          <q-item-section side>
            <q-icon :name="orderMenuExpanded ? 'expand_less' : 'expand_more'" />
          </q-item-section>
        </q-item>
        <q-separator v-if="orderMenuExpanded" />
        <q-item
          v-if="orderMenuExpanded"
          clickable
          v-ripple
          @click="selectMenu('BookingShow')"
          >Show Booking</q-item
        >
      </q-list>
    </q-drawer>

    <!-- Page Container -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const drawer = ref(false);
    const itemMenuExpanded = ref(false);
    const orderMenuExpanded = ref(false);
    const billMenuExpanded = ref(false);
    const router = useRouter();

    const $q = useQuasar();
    const quasarVersion = computed(() => $q.version);

    const toggleLeftDrawer = () => {
      drawer.value = !drawer.value;
    };

    const toggleItemMenu = () => {
      itemMenuExpanded.value = !itemMenuExpanded.value;
    };

    const toggleOrderMenu = () => {
      orderMenuExpanded.value = !orderMenuExpanded.value;
    };

    const toggleBillMenu = () => {
      billMenuExpanded.value = !billMenuExpanded.value;
    };

    const selectMenu = (menuItem: string) => {
      router.push({ name: menuItem });
      // Perform actions based on menuItem
    };

    return {
      drawer,
      itemMenuExpanded,
      orderMenuExpanded,
      billMenuExpanded,
      toggleLeftDrawer,
      toggleItemMenu,
      toggleOrderMenu,
      toggleBillMenu,
      selectMenu,
      quasarVersion,
    };
  },
};
</script>

<style>
/* Add custom styles if necessary */
</style>
