<template>
  <q-page padding>
    <div class="q-pa-md">
      <div style="margin-bottom: 50px" v-if="isManager">
        <q-btn
          label="Add New Field"
          color="primary"
          @click="showDialog = true"
        />
      </div>

      <!-- New Field Dialog -->
      <q-dialog v-model="showDialog" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">Add New Field</div>
          </q-card-section>

          <q-card-section>
            <q-input
              disable
              v-if="isEditMode"
              v-model="newField.fieldId"
              label="Field ID"
            />
            <q-input v-else v-model="newField.fieldId" label="Field ID" />
            <q-input v-model="newField.fieldName" label="Field Name" />
            <q-input v-model="newField.location" label="Location" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Cancel"
              color="primary"
              @click="
                showDialog = false;
                isEditMode = false;
              "
            />
            <q-btn flat label="Save" color="primary" @click="saveNewField" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Create/Edit Sport Dialog -->
      <q-dialog v-model="editSportDialog" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">
              {{ newSport.sportName ? 'Edit Sport' : 'Add New Sport' }}
            </div>
          </q-card-section>

          <q-card-section>
            <q-input
              v-if="isEditMode"
              v-model="newSport.sportName"
              label="Sport Name"
              disable
            />
            <q-input v-else v-model="newSport.sportName" label="Sport Name" />
            <q-input
              v-model="newSport.sportDescription"
              label="Sport Description"
            />
            <!-- Add more inputs for sport details if needed -->
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Cancel"
              color="primary"
              @click="
                editSportDialog = false;
                isEditMode = false;
              "
            />
            <q-btn flat label="Save" color="primary" @click="saveSport" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Create/Edit Package Dialog -->
      <q-dialog v-model="editPackageDialog" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">
              {{ newPackage.packageName ? 'Edit Package' : 'Add New Package' }}
            </div>
          </q-card-section>

          <q-card-section>
            <q-input
              disable
              v-if="isEditMode"
              v-model="newPackage.packageName"
              label="Package Name"
            />
            <q-input
              v-else
              v-model="newPackage.packageName"
              label="Package Name"
            />
            <q-input v-model="newPackage.price" label="Price" type="number" />
            <q-input v-model="newPackage.sku" label="SKU" />
            <q-input
              v-model="newPackage.duration"
              label="Duration (Jam)"
              type="number"
            />
            <q-input
              v-model="newPackage.details"
              label="Berapa Kali Main"
              type="number"
            />
            <!-- Add more inputs for package details if needed -->
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Cancel"
              color="primary"
              @click="
                editPackageDialog = false;
                isEditMode = false;
              "
            />
            <q-btn flat label="Save" color="primary" @click="savePackage" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <div
        v-for="field in fields"
        :key="field.fieldId"
        class="q-mb-md field-card"
      >
        <q-card>
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-h6">{{ field.fieldName }}</div>
              <div>{{ field.location }}</div>
            </div>
            <div>
              <div v-if="isManager">
                <q-btn flat icon="edit" @click="editField(field)" />
                <q-btn
                  flat
                  icon="delete"
                  color="negative"
                  @click="confirmDelete(field)"
                />
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <div
            v-for="sport in field.sports"
            :key="sport.sportName"
            class="q-mt-md sport-card"
          >
            <q-card-section class="row items-center justify-between">
              <div>
                <div class="text-subtitle1">{{ sport.sportName }}</div>
                <div>{{ sport.sportDescription }}</div>
              </div>
              <div v-if="isManager">
                <q-btn flat icon="edit" @click="editSport(sport, field)" />
                <q-btn
                  flat
                  icon="delete"
                  @click="confirmDelete(field, sport)"
                  color="negative"
                />
              </div>
            </q-card-section>

            <div
              v-for="pck in sport.packages"
              :key="pck.packageName"
              class="q-mt-md package-card"
            >
              <q-card-section class="row items-center justify-between">
                <div>
                  <div class="text-subtitle1">{{ pck.packageName }}</div>
                  <div>{{ pck.details }} x Main</div>
                  <div>{{ pck.sku }}</div>
                  <div>Rp. {{ pck.price }}</div>
                  <div>{{ pck.duration }} Jam</div>
                </div>
                <div v-if="isManager">
                  <q-btn
                    flat
                    icon="edit"
                    @click="editPackage(pck, sport, field)"
                  />
                  <q-btn
                    flat
                    icon="delete"
                    color="negative"
                    @click="confirmDelete(field, sport, pck)"
                  />
                </div>
              </q-card-section>
            </div>
            <q-btn
              v-if="isManager"
              flat
              icon="add"
              @click="createPackage(sport, field)"
              label="Add Package"
            />
          </div>
          <q-card-section>
            <q-btn
              flat
              v-if="isManager"
              icon="add"
              @click="createSport(field)"
              label="Add Sport"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
    <q-inner-loading
      :showing="loading"
      label="Please wait..."
      label-class="text-blue"
      label-style="font-size: 1.1em"
    />
  </q-page>
</template>

<script lang="ts">
import { IField, ISport, IPackage } from 'src/types/interfaces';
import { defineComponent, onMounted, ref } from 'vue';
import {
  getFirestore,
  collection,
  setDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import Swal from 'sweetalert2';
import { useLiveData } from 'src/stores/live-data';
import { useUserStore } from 'src/stores/user-store';

export default defineComponent({
  name: 'FieldsList',
  setup() {
    const fields = ref([] as IField[]);
    const showDialog = ref(false);
    const newField = ref({} as IField);
    const newSport = ref({} as ISport);
    const editSportDialog = ref(false);
    const newPackage = ref({} as IPackage);
    const editPackageDialog = ref(false);
    const isManager = ref(false);

    const loading = ref(true);

    const isEditMode = ref(false);

    const db = getFirestore();
    const liveData = useLiveData();

    const loadFields = async () => {
      await liveData.loadFields();
      loading.value = false;
      fields.value = liveData.fields;
    };

    const userStore = useUserStore();

    const saveNewField = async () => {
      if (
        newField.value.fieldId &&
        newField.value.fieldName &&
        newField.value.location
      ) {
        const fieldRef = doc(db, 'lapangan', newField.value.fieldId); // Create a document reference with fieldId
        await setDoc(fieldRef, {
          fieldId: newField.value.fieldId,
          fieldName: newField.value.fieldName,
          location: newField.value.location,
          // Add other field properties if needed
        });
        showDialog.value = false;
        loadFields(); // Reload fields list
      }
    };

    const editField = (field: IField) => {
      isEditMode.value = true;
      newField.value = { ...field };
      showDialog.value = true;
    };

    const deleteField = async (field: IField) => {
      const lapanganRef = doc(db, 'lapangan', field.fieldId);
      await deleteDoc(lapanganRef);
      loadFields();
    };

    const createSport = (field: IField) => {
      newField.value = { ...field };
      newSport.value = {} as ISport; // Reset the sport data
      editSportDialog.value = true;
    };

    const editSport = (sport: ISport, field: IField) => {
      isEditMode.value = true;
      newField.value = { ...field };
      newSport.value = { ...sport }; // Copy the sport data for editing
      editSportDialog.value = true;
    };

    const saveSport = async () => {
      if (
        newField.value.fieldId &&
        newSport.value.sportName &&
        newSport.value.sportDescription
      ) {
        const sportName =
          newSport.value.sportName ||
          doc(collection(db, 'lapangan', newField.value.fieldId, 'Sports')).id; // Generate new ID or use existing one
        const sportRef = doc(
          db,
          'lapangan',
          newField.value.fieldId,
          'Sports',
          sportName
        );

        await setDoc(sportRef, {
          sportName: newSport.value.sportName,
          sportDescription: newSport.value.sportDescription,
        });

        editSportDialog.value = false;
        isEditMode.value = false;
        loadFields();
      }
    };

    const confirmDelete = (field?: IField, sport?: ISport, pck?: IPackage) => {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      }).then((result) => {
        if (result.isConfirmed) {
          if (sport && field && pck) {
            deletePackage(pck, sport, field);
          } else if (sport && field) {
            deleteSport(sport, field);
          } else if (field) {
            deleteField(field);
          }
        }
      });
    };

    const deleteSport = async (sport: ISport, field: IField) => {
      // Logic to delete the sport from Firestore
      const sportRef = doc(
        db,
        'lapangan',
        field.fieldId,
        'Sports',
        sport.sportName
      );
      await deleteDoc(sportRef);
      loadFields();
    };

    const createPackage = (sport: ISport, field: IField) => {
      newSport.value = { ...sport };
      newField.value = { ...field };
      newPackage.value = {} as IPackage; // Reset the package data
      editPackageDialog.value = true;
      // You might need to keep track of the parent sport here
    };

    const editPackage = (pck: IPackage, sport: ISport, field: IField) => {
      isEditMode.value = true;
      newSport.value = { ...sport };
      newField.value = { ...field };
      newPackage.value = { ...pck }; // Copy the package data for editing
      editPackageDialog.value = true;
    };

    const savePackage = async () => {
      // Logic to save the new or edited package to Firestore
      if (
        newField.value.fieldId &&
        newSport.value.sportName &&
        newPackage.value.packageName
      ) {
        const packageName =
          newPackage.value.packageName ||
          doc(
            collection(
              db,
              'lapangan',
              newField.value.fieldId,
              'Sports',
              newSport.value.sportName,
              'Packages'
            )
          ).id; // Generate new ID or use existing one
        const packageRef = doc(
          db,
          'lapangan',
          newField.value.fieldId,
          'Sports',
          newSport.value.sportName,
          'Packages',
          packageName
        );

        await setDoc(packageRef, {
          packageName: newPackage.value.packageName,
          price: newPackage.value.price,
          sku: newPackage.value.sku,
          duration: newPackage.value.duration,
          details: newPackage.value.details,
        });

        editPackageDialog.value = false;
        isEditMode.value = false;
        loadFields();
      }
      // Refresh the fields list if necessary
    };

    const deletePackage = async (
      pck: IPackage,
      sport: ISport,
      field: IField
    ) => {
      // Logic to delete the package from Firestore
      const packageRef = doc(
        db,
        'lapangan',
        field.fieldId,
        'Sports',
        sport.sportName,
        'Packages',
        pck.packageName
      );
      await deleteDoc(packageRef);
      loadFields();
    };

    onMounted(() => {
      loadFields();
      if (
        userStore.currentUser.role === 'Manager' ||
        userStore.currentUser.role === 'Super Admin'
      ) {
        isManager.value = true;
      }
    });

    return {
      isEditMode,
      fields,
      newField,
      showDialog,
      editField,
      saveNewField,
      newSport,
      editSportDialog,
      createSport,
      editSport,
      confirmDelete,
      saveSport,
      newPackage,
      editPackageDialog,
      isManager,
      createPackage,
      editPackage,
      savePackage,
      loading,
    };
  },
  filters: {
    currency(value: number) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
      }).format(value);
    },
  },
});
</script>

<style>
.field-card {
  background-color: #d34949; /* Light gray background for field */
}

.sport-card {
  background-color: #a7dba1; /* Slightly darker for sport */
  margin-left: 20px; /* Indent sports */
}

.package-card {
  background-color: #6eb0df; /* Even darker for package */
  margin-left: 40px; /* Indent packages */
}
</style>
