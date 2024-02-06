<template>
  <q-page padding>
    <div>
      <!-- User Creation Form -->
      <q-form @submit.prevent="createUser">
        <q-input v-model="newUser.name" label="Name" />
        <q-input v-model="newUser.email" label="Email" />
        <q-input v-model="newUser.password" type="password" label="Password" />
        <q-input v-model="newUser.phoneNumber" label="Nomor HP" />
        <q-select
          v-model="newUser.role"
          label="Role"
          :options="roles"
        ></q-select>
        <q-btn
          label="Create User"
          type="submit"
          color="primary"
          style="margin-top: 20px"
        />
      </q-form>
    </div>
    <div style="margin-top: 50px">
      <!-- User List Table -->
      <q-table title="Users List" :rows="users" :columns="columns" row-key="id">
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              icon="edit"
              @click="editRole(props.row)"
              label="Edit Role"
            />
            <q-btn
              flat
              icon="delete"
              @click="deleteOldUser(props.row)"
              label="Delete"
            />
          </q-td>
        </template>
      </q-table>
    </div>

    <q-dialog v-model="editDialog" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Edit User Role</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="selectedUser.name" label="Name" />
          <q-input v-model="selectedUser.email" label="Email" />
          <q-input
            v-model="selectedUser.password"
            type="password"
            label="Password"
          />
          <q-input v-model="selectedUser.phoneNumber" label="Nomor HP" />
          <q-select
            v-model="selectedRole"
            label="Select New Role"
            :options="roles"
          ></q-select>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Update" color="primary" @click="updateUserRole" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-inner-loading
      :showing="loading"
      label="Please wait..."
      label-class="text-blue"
      label-style="font-size: 1.1em"
    />
  </q-page>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent, computed } from 'vue';
import { db } from 'src/firebaseConfig';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword,
  updateEmail,
  deleteUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { User } from 'src/types/interfaces';
import Swal from 'sweetalert2';
import { useUserStore } from 'src/stores/user-store';

export default defineComponent({
  setup() {
    const allUser = ref([] as User[]);
    const newUser = ref({} as User);

    const isSuperAdmin = ref(false);
    const userStore = useUserStore();
    const loading = ref(true);

    const roles = computed(() => {
      const baseRoles = [
        { label: 'Customer Service', value: 'Customer Service' },
        { label: 'Community', value: 'Community' },
      ];

      if (isSuperAdmin.value) {
        return [{ label: 'Manager', value: 'Manager' }, ...baseRoles];
      } else {
        return baseRoles;
      }
    });

    const users = computed(() => {
      if (isSuperAdmin.value) {
        return allUser.value;
      } else {
        return allUser.value.filter(
          (user) => user.role !== 'Manager' && user.role !== 'Super Admin'
        );
      }
    });

    const columns = ref([
      { name: 'name', label: 'Nama', field: 'name', sortable: true },
      {
        name: 'phoneNumber',
        label: 'Nomer HP',
        field: 'phoneNumber',
        sortable: true,
      },
      { name: 'email', label: 'Email', field: 'email', sortable: true },
      { name: 'role', label: 'Role', field: 'role', sortable: true },
      { name: 'actions', label: 'Actions', field: 'actions', sortable: false },
    ]);

    const editDialog = ref(false);
    const selectedUser = ref({} as User);
    const selectedRole = ref({ label: '', value: '' });
    const oldPassword = ref('');

    const editRole = (user: User) => {
      selectedUser.value = user;
      oldPassword.value = user.password;
      editDialog.value = true;
    };

    const updateUserRole = async () => {
      try {
        if (selectedUser.value.id) {
          const userRef = doc(db, 'users', selectedUser.value.id);
          const pass = oldPassword.value;

          selectedUser.value.role = selectedRole.value.value;

          // Update user role in Firestore
          await updateDoc(userRef, {
            ...selectedUser.value,
          });

          const auth = getAuth();
          const userCredential = await signInWithEmailAndPassword(
            auth,
            selectedUser.value.email,
            pass
          );

          // Update email
          await updateEmail(userCredential.user, selectedUser.value.email).then(
            () => {
              console.log('Email updated successfully!');
            }
          );

          // Update password
          await updatePassword(
            userCredential.user,
            selectedUser.value.password
          ).then(() => {
            console.log('Password updated successfully!');
          });

          // Update the role in the local 'users' array
          const userIndex = allUser.value.findIndex(
            (u) => u.id === selectedUser.value.id
          );
          if (userIndex !== -1) {
            allUser.value[userIndex].role = selectedRole.value.value;
          }

          editDialog.value = false; // Close dialog
          // Show success message
          Swal.fire('Updated!', 'User role has been updated.', 'success');
          const querySnapshot = await getDocs(collection(db, 'users'));

          allUser.value = [];
          querySnapshot.forEach((doc) => {
            allUser.value.push(doc.data());
          });
          selectedUser.value = {} as User;
        }
      } catch (error) {
        console.error('Error updating user role:', error);
        selectedUser.value = {} as User;
      }
    };

    onMounted(async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      querySnapshot.forEach((doc) => {
        allUser.value.push(doc.data());
      });
      if (userStore.currentUser.role === 'Super Admin') {
        isSuperAdmin.value = true;
      }
      loading.value = false;
    });

    const createUser = async () => {
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
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          newUser.value.email,
          newUser.value.password
        );
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          id: userCredential.user.uid,
          email: newUser.value.email,
          role: newUser.value.role.value,
          password: newUser.value.password,
          phoneNumber: newUser.value.phoneNumber,
          name: newUser.value.name,
          // other initial user data...
        });
        newUser.value = {} as User; // Reset form

        allUser.value = [];
        const querySnapshot = await getDocs(collection(db, 'users'));
        querySnapshot.forEach((doc) => {
          allUser.value.push(doc.data());
        });

        Swal.close();
        await Swal.fire({
          title: 'User Created Successfully',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        });
      } catch (error) {
        console.error('Error creating user:', error);
        Swal.close();
      }
    };

    const deleteOldUser = async (user: User) => {
      try {
        Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!',
        }).then(async (result) => {
          if (result.isConfirmed) {
            const userRef = doc(db, 'users', user.id!);

            const auth = getAuth();
            const userCredential = await signInWithEmailAndPassword(
              auth,
              user.email,
              user.password
            );

            await deleteUser(userCredential.user);

            // Delete user from Firestore
            await deleteDoc(userRef);
            allUser.value = allUser.value.filter((u) => u.id !== user.id);

            Swal.fire('Deleted!', 'User has been deleted.', 'success');
            // Refresh items list or handle UI update here
          }
        });
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    };

    return {
      users,
      newUser,
      roles,
      selectedUser,
      createUser,
      deleteUser,
      columns,
      editRole,
      updateUserRole,
      deleteOldUser,
      editDialog,
      selectedRole,
      loading,
    };
  },
});
</script>
