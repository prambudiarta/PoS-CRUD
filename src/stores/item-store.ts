// src/stores/itemStore.js

import { defineStore } from 'pinia';
import { db } from 'src/firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Categories, Item } from 'src/types/interfaces';
import uploadImage from 'src/utils/uploadImages';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';

export const useItemStore = defineStore('itemStore', {
  state: () => ({
    items: [] as Item[],
    categories: [] as Categories[],
  }),
  getters: {
    // Define any getters here
  },
  actions: {
    async fetchItems() {
      const querySnapshot = await getDocs(collection(db, 'items'));
      this.items = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Ensure that the data conforms to the Item type
        const item: Item = {
          id: doc.id,
          name: data.name,
          price: data.price,
          category: data.category,
          imageUrl: data.imageUrl, // This field might be optional
        };
        return item;
      });
    },
    async saveItem(item: Omit<Item, 'id'>, file: File | null) {
      let imageUrl = '';
      if (file) {
        imageUrl = await uploadImage(file);
      }

      const docRef = await addDoc(collection(db, 'items'), {
        ...item,
        imageUrl: imageUrl, // This will be an empty string if no file is uploaded
      });

      this.items.push({ id: docRef.id, ...item, imageUrl });
    },
    async deleteItem(itemId: string) {
      await deleteDoc(doc(db, 'items', itemId));
      // Optionally, you could also remove the item from the local 'items' array
      this.items = this.items.filter((item) => item.id !== itemId);
    },
    async updateItem(updatedItem: Item, file: File | null) {
      if (!updatedItem.id) {
        throw new Error('Item must have an ID for updating');
      }

      let imageUrl = '';
      if (file) {
        imageUrl = await uploadImage(file);
      }

      const itemRef = doc(db, 'items', updatedItem.id);

      const updateObject = {
        name: updatedItem.name,
        price: updatedItem.price,
        category: updatedItem.category,
        imageUrl: imageUrl === '' ? updatedItem.imageUrl : imageUrl,
      };

      await updateDoc(itemRef, updateObject);

      // Optionally, update the item in the local 'items' array
      const index = this.items.findIndex((item) => item.id === updatedItem.id);
      if (index !== -1) {
        this.items[index] = updatedItem;
      }
    },
    async fetchCategories() {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      this.categories = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Ensure that the data conforms to the Item type
        const categories: Categories = {
          id: doc.id,
          imageUrl: data.imageUrl,
          category: data.category,
        };
        return categories;
      });
    },
    async saveCategory(category: Omit<Categories, 'id'>, file: File | null) {
      let imageUrl = '';
      if (file) {
        imageUrl = await uploadImage(file);
      }

      const docRef = await addDoc(collection(db, 'categories'), {
        ...category,
        imageUrl: imageUrl,
      });

      this.categories.push({ id: docRef.id, ...category });
    },
    async deleteCategoriy(categoryId: string) {
      await deleteDoc(doc(db, 'categories', categoryId));
      // Optionally, you could also remove the item from the local 'items' array
      this.categories = this.categories.filter(
        (category) => category.id !== categoryId
      );
    },
    async updateCategory(updatedCategory: Categories, file: File | null) {
      if (!updatedCategory.id) {
        throw new Error('Category must have an ID for updating');
      }

      let imageUrl = '';
      if (file) {
        imageUrl = await uploadImage(file);
      }

      const categoryRef = doc(db, 'categories', updatedCategory.id);

      const updateObject = {
        category: updatedCategory.category,
        imageUrl: imageUrl === '' ? updatedCategory.imageUrl : imageUrl,
      };

      await updateDoc(categoryRef, updateObject);

      // Optionally, update the item in the local 'items' array
      const index = this.categories.findIndex(
        (item) => item.id === updatedCategory.id
      );
      if (index !== -1) {
        this.categories[index] = updatedCategory;
      }
    },
  },
});
