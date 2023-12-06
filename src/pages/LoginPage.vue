<template>
  <q-layout view="hHh lpR fFf" class="bg-login">
    <q-page-container>
      <q-page class="flex flex-center">
        <q-card class="login-card" raised>
          <q-card-section>
            <div class="text-h5 text-center q-mb-md">Login to Your Account</div>

            <q-input
              filled
              v-model="user.email"
              label="Email"
              type="email"
              dense
              class="q-mb-md"
              placeholder="Enter your email"
            />

            <q-input
              filled
              v-model="user.password"
              label="Password"
              type="password"
              dense
              class="q-mb-md"
              placeholder="Enter your password"
              @keyup.enter="login"
            />

            <q-btn
              label="Login"
              color="primary"
              @click="login"
              class="full-width"
              size="lg"
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

<style>
.bg-login {
  background-image: url('path_to_your_background_image');
  background-size: cover;
  background-position: center;
}

.login-card {
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

@media (max-width: 600px) {
  .login-card {
    max-width: 350px;
  }
}
</style>
