<template>
  <q-layout view="hHh lpR fFf" class="bg-login">
    <q-page-container>
      <q-page class="flex flex-center">
        <q-card class="login-card" raised>
          <q-card-section>
            <div class="text-h5 text-center q-mb-md">Karaoke PoS System</div>

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
import { db } from 'src/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useUserStore } from 'src/stores/user-store';

export default {
  setup() {
    const router = useRouter();
    const user = ref({
      email: '',
      password: '',
    });

    const login = async () => {
      try {
        Swal.fire({
          title: 'Processing...',
          text: 'Please wait.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(
          auth,
          user.value.email,
          user.value.password
        );

        // Fetch user data from Firestore
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);

        // Set user data in store
        const userStore = useUserStore();
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userStore.setUser({
            id: userCredential.user.uid,
            email: userData.email,
            role: userData.role,
          });
        } else {
          // If user data does not exist in Firestore, treat as super admin

          if (user.value.email === 'prambudiarta@gmail.com') {
            userStore.setUser({
              id: userCredential.user.uid,
              email: user.value.email,
              role: 'Manager',
            });
          } else {
            throw Error('User Sudah Dihapus!');
          }
        }

        // Redirect based on role
        Swal.close();
        router.push('/admin');
      } catch (error) {
        Swal.close();
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
  background-image: url('https://wallpapers.com/images/hd/karaoke-background-td0p34xmna8wjn61.jpg');
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
