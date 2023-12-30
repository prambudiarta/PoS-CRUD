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

        <q-toolbar-title> Dashboard </q-toolbar-title>

        <div>Powered By Galih @ 2024</div>
      </q-toolbar>
    </q-header>

    <!-- Sidebar -->
    <q-drawer show-if-above v-model="drawer" side="left" bordered>
      <q-list v-if="!isCommunity">
        <!-- Item Menu -->
        <q-item clickable v-ripple @click="toggleItemMenu">
          <q-item-section>Menu</q-item-section>
          <q-item-section side>
            <q-icon :name="itemMenuExpanded ? 'expand_less' : 'expand_more'" />
          </q-item-section>
        </q-item>
        <q-separator v-if="itemMenuExpanded" />
        <q-item
          v-if="itemMenuExpanded"
          clickable
          v-ripple
          @click="selectMenu('categoryShow')"
          >Manage Categories</q-item
        >
        <q-item
          v-if="itemMenuExpanded"
          clickable
          v-ripple
          @click="selectMenu('ItemShow')"
          >Manage Item</q-item
        >
      </q-list>

      <q-list v-if="!isCommunity">
        <!-- Item Menu -->
        <q-item clickable v-ripple @click="toggleDeviceMenu">
          <q-item-section>Devices</q-item-section>
          <q-item-section side>
            <q-icon
              :name="deviceMenuExpanded ? 'expand_less' : 'expand_more'"
            />
          </q-item-section>
        </q-item>
        <q-separator v-if="deviceMenuExpanded" />
        <q-item
          v-if="deviceMenuExpanded"
          clickable
          v-ripple
          @click="selectMenu('roomShow')"
          >Manage Room</q-item
        >
        <q-item
          v-if="deviceMenuExpanded"
          clickable
          v-ripple
          @click="selectMenu('printerShow')"
          >Manage Printer</q-item
        >
      </q-list>

      <q-item v-if="isManager" clickable v-ripple @click="userManagement">
        <q-item-section> Cek User </q-item-section>
      </q-item>

      <!-- Logout Menu Item -->
      <q-separator />
      <q-item clickable v-ripple @click="logOut">
        <q-item-section>
          <q-icon name="logout" />
        </q-item-section>
        <q-item-section> LOGOUT </q-item-section>
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
import { getAuth, signOut } from 'firebase/auth';
import Swal from 'sweetalert2';
import { useUserStore } from 'src/stores/user-store';

export default {
  setup() {
    const drawer = ref(false);
    const itemMenuExpanded = ref(false);
    const deviceMenuExpanded = ref(false);
    const billMenuExpanded = ref(false);
    const isManager = ref(false);
    const isCommunity = ref(false);
    const router = useRouter();

    const $q = useQuasar();
    const quasarVersion = computed(() => $q.version);

    const userStore = useUserStore();

    onMounted(() => {
      if (userStore.currentUser.role === 'Community') {
        isCommunity.value = true;
      } else if (
        userStore.currentUser.role === 'Manager' ||
        userStore.currentUser.role === 'super-admin'
      ) {
        isManager.value = true;
      }
    });

    const toggleLeftDrawer = () => {
      drawer.value = !drawer.value;
    };

    const toggleItemMenu = () => {
      itemMenuExpanded.value = !itemMenuExpanded.value;
    };

    const toggleDeviceMenu = () => {
      deviceMenuExpanded.value = !deviceMenuExpanded.value;
    };

    const toggleBillMenu = () => {
      billMenuExpanded.value = !billMenuExpanded.value;
    };

    const selectMenu = (menuItem: string) => {
      router.push({ name: menuItem });
      // Perform actions based on menuItem
    };

    const userManagement = () => {
      router.push({ name: 'showUser' });
      // Perform actions based on menuItem
    };

    const logOut = async () => {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: 'Konfirmasi',
        text: 'Apakah Anda yakin ingin keluar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Keluar',
        cancelButtonText: 'Batal',
      });

      // Check if user confirmed
      if (result.isConfirmed) {
        try {
          const auth = getAuth();
          await signOut(auth);
          userStore.clearUser();
          // Redirect to the login page after logout
          router.push({ name: 'login' });
        } catch (error) {
          console.error('Error logging out:', error);
          Swal.fire('Error', 'Terjadi kesalahan saat keluar.', 'error');
        }
      }
    };

    return {
      drawer,
      itemMenuExpanded,
      deviceMenuExpanded,
      billMenuExpanded,
      toggleLeftDrawer,
      toggleItemMenu,
      toggleDeviceMenu,
      toggleBillMenu,
      selectMenu,
      userManagement,
      logOut,
      quasarVersion,
      isManager,
      isCommunity,
    };
  },
};
</script>

<style>
/* Add custom styles if necessary */
</style>
