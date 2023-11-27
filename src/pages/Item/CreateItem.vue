<template>
  <q-page padding>
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <q-card>
        <q-card-section>
          <div class="text-h6">Create New Item</div>
        </q-card-section>

        <q-card-section>
          <q-input
            filled
            v-model="item.name"
            label="Item Name"
            :rules="[(val) => !!val || 'Item name is required']"
          />

          <q-input
            type="number"
            filled
            v-model="item.price"
            label="Price"
            :rules="[(val) => val > 0 || 'Price must be greater than 0']"
          />

          <q-select
            filled
            v-model="item.category"
            :options="categories"
            label="Category"
            :rules="[(val) => !!val || 'Category is required']"
          />

          <q-file
            filled
            v-model="imageFile"
            label="Upload Item Image"
            accept="image/*"
          />

          <div>
            <q-btn label="Submit" type="submit" color="primary" />
            <q-btn
              label="Reset"
              type="reset"
              color="primary"
              flat
              class="q-ml-md"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-form>
  </q-page>
</template>

<script lang="ts">
import { useItemStore } from 'src/stores/item-store';
import { ref } from 'vue';
import Swal from 'sweetalert2';

export default {
  setup() {
    const item = ref({
      name: '',
      price: 0,
      category: '',
    });

    const itemStore = useItemStore();
    const imageFile = ref(null);

    const categories = ref(['Drinks', 'Snacks', 'Main Course', 'Desserts']);

    const onSubmit = async () => {
      console.log(imageFile.value);
      try {
        await itemStore.saveItem(item.value, imageFile.value);

        // Show success notification
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Item added successfully!',
        });

        // Optionally, reset the form or redirect the user
        onReset();
      } catch (error) {
        // Show error notification
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!',
          footer: '<a href="">What went wrong?</a>', // You can provide additional information or link here
        });
      }
    };

    const onReset = () => {
      item.value = { name: '', price: 0, category: '' };
      imageFile.value = null;
    };

    return {
      item,
      imageFile,
      categories,
      onSubmit,
      onReset,
    };
  },
};
</script>
