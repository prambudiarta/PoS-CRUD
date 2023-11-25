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

        <q-toolbar-title>
          Karaoke Room PoS
        </q-toolbar-title>

        <div>Quasar v{{ quasarVersion }}</div>
      </q-toolbar>
    </q-header>

    <!-- Sidebar -->
    <q-drawer show-if-above v-model="drawer" side="left" bordered>
      <q-list>
        <!-- Item Menu -->
        <q-item clickable v-ripple @click="toggleItemMenu">
          <q-item-section>Item</q-item-section>
          <q-item-section side>
            <q-icon :name="itemMenuExpanded ? 'expand_less' : 'expand_more'" />
          </q-item-section>
        </q-item>
        <q-separator v-if="itemMenuExpanded" />
        <q-item v-if="itemMenuExpanded" clickable v-ripple @click="selectMenu('ItemCreate')">Create Item</q-item>
        <q-item v-if="itemMenuExpanded" clickable v-ripple @click="selectMenu('ItemShow')">Show Item</q-item>

        <!-- Order Menu -->
        <q-item clickable v-ripple @click="toggleOrderMenu">
          <q-item-section>Order</q-item-section>
          <q-item-section side>
            <q-icon :name="orderMenuExpanded ? 'expand_less' : 'expand_more'" />
          </q-item-section>
        </q-item>
        <q-separator v-if="orderMenuExpanded" />
        <q-item v-if="orderMenuExpanded" clickable v-ripple @click="selectMenu('OrderShow')">Show Order</q-item>
        <q-item v-if="orderMenuExpanded" clickable v-ripple @click="selectMenu('OrderPrint')">Print Order</q-item>

        <!-- Bill Menu -->
        <q-item clickable v-ripple @click="toggleBillMenu">
          <q-item-section>Bill</q-item-section>
          <q-item-section side>
            <q-icon :name="billMenuExpanded ? 'expand_less' : 'expand_more'" />
          </q-item-section>
        </q-item>
        <q-separator v-if="billMenuExpanded" />
        <q-item v-if="billMenuExpanded" clickable v-ripple @click="selectMenu('BillShow')">Show Bill</q-item>
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
      router.push({name: menuItem})
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
      quasarVersion
    };
  }
};
</script>

<style>
/* Add custom styles if necessary */
</style>
