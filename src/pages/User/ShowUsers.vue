<template>
  <q-page padding>
    <div>
      <!-- User Creation Form -->
      <q-form @submit.prevent="createUser">
        <q-input v-model="newUser.email" label="Email" />
        <q-input v-model="newUser.password" type="password" label="Password" />

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
              @click="deleteUser(props.row)"
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
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue';
import { db } from 'src/firebaseConfig';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import Swal from 'sweetalert2';

export default {
  setup() {
    const users = ref([]);
    const newUser = ref({ email: '', password: '', role: '' });
    const roles = ref([
      { label: 'Manager', value: 'Manager' },
      { label: 'Customer Service', value: 'Customer Service' },
      { label: 'Community', value: 'Community' },
    ]);

    const columns = ref([
      { name: 'email', label: 'Email', field: 'email', sortable: true },
      { name: 'role', label: 'Role', field: 'role', sortable: true },
      { name: 'actions', label: 'Actions', field: 'actions', sortable: false },
    ]);

    const editDialog = ref(false);
    const selectedUser = ref({});
    const selectedRole = ref('');

    const editRole = (user) => {
      selectedUser.value = user;
      editDialog.value = true;
    };

    const updateUserRole = async () => {
      try {
        if (selectedUser.value) {
          const userRef = doc(db, 'users', selectedUser.value.id);

          // Update user role in Firestore
          await updateDoc(userRef, {
            role: selectedRole.value.value,
          });

          // Update the role in the local 'users' array
          const userIndex = users.value.findIndex(
            (u) => u.id === selectedUser.value.id
          );
          if (userIndex !== -1) {
            users.value[userIndex].role = selectedRole.value;
          }

          editDialog.value = false; // Close dialog
          // Show success message
          Swal.fire('Updated!', 'User role has been updated.', 'success');
          const querySnapshot = await getDocs(collection(db, 'users'));

          users.value = [];
          querySnapshot.forEach((doc) => {
            users.value.push(doc.data());
          });
        }
      } catch (error) {
        console.error('Error updating user role:', error);
      }
    };

    onMounted(async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      querySnapshot.forEach((doc) => {
        users.value.push(doc.data());
      });
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
          // other initial user data...
        });
        newUser.value = { email: '', password: '', role: '' }; // Reset form

        users.value = [];
        const querySnapshot = await getDocs(collection(db, 'users'));
        querySnapshot.forEach((doc) => {
          users.value.push(doc.data());
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
        Swal.fire({
          title: 'Mohon Maaf, Gagal Membuat User',
          text: error,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        });
      }
    };

    const deleteUser = async (user) => {
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
            const userRef = doc(db, 'users', user.id);

            // Delete user from Firestore
            await deleteDoc(userRef);
            users.value = users.value.filter((u) => u.id !== user.id);

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
      createUser,
      deleteUser,
      columns,
      editRole,
      updateUserRole,
      editDialog,
      selectedRole,
    };
  },
};
</script>
