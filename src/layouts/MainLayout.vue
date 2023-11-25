<template>
  <q-layout view="lHh Lpr lFf">
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

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header>
          Menu
        </q-item-label>

        <q-item clickable @click="navigateTo('create-item')">
          <q-item-section>
            <q-item-label>Create Item</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable @click="navigateTo('check-order')">
          <q-item-section>
            <q-item-label>Check Order</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable @click="navigateTo('close-bill')">
          <q-item-section>
            <q-item-label>Close Bill & Show Invoice</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const leftDrawerOpen = ref(false);
const route = useRoute();
const router = useRouter();

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function navigateTo(routeName: string) {
  router.push({ name: routeName });
}
</script>
