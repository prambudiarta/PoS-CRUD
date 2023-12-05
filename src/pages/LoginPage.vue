<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center">
        <q-card>
          <q-card-section>
            <div class="text-h6" style="text-align: center">
              Login to Your Account
            </div>
            <q-input filled v-model="user.email" label="Email" type="email" />
            <q-input
              filled
              v-model="user.password"
              label="Password"
              type="password"
            />
            <q-btn
              label="Login"
              color="primary"
              @click="login"
              class="full-width q-mt-md"
            />
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from 'vue';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

export default {
  setup() {
    const router = useRouter();
    const user = ref({
      email: '',
      password: '',
    });

    const login = async () => {
      try {
        const auth = getAuth();
        await signInWithEmailAndPassword(
          auth,
          user.value.email,
          user.value.password
        );

        // Handle redirection after successful login
        router.push('/admin');
      } catch (error) {
        console.error('Error logging in: ', error);

        let errorMessage = 'Login failed. Please try again.';
        if (
          error.code === 'auth/invalid-email' ||
          error.code === 'auth/auth/invalid-login-credentials'
        ) {
          errorMessage = 'Username atau password salah.';
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage =
            'Kesalahan jaringan. Silakan cek koneksi Anda dan coba lagi.';
        } // Add more error codes as needed

        Swal.fire('Error', errorMessage, 'error');
        // Handle login errors (e.g., show a notification)
      }
    };

    return {
      user,
      login,
    };
  },
};
</script>
