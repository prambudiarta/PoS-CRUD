<template>
  <q-page padding>
    <div class="q-pa-md">
      <div style="margin-bottom: 50px">
        <q-btn
          label="Add New Field"
          color="primary"
          @click="showDialog = true"
        />
      </div>
      <!-- New Field Dialog -->
      <q-dialog v-model="showDialog">
        <q-card>
          <q-card-section>
            <div class="text-h6">Add New Field</div>
          </q-card-section>

          <q-card-section>
            <q-input v-model="newField.fieldId" label="Field ID" />
            <q-input v-model="newField.fieldName" label="Field Name" />
            <q-input v-model="newField.location" label="Location" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Cancel"
              color="primary"
              @click="showDialog = false"
            />
            <q-btn flat label="Save" color="primary" @click="saveNewField" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <div v-for="field in fields" :key="field.fieldId" class="q-mb-md">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ field.fieldName }}</div>
            <div>{{ field.location }}</div>
          </q-card-section>

          <q-separator />

          <div
            v-for="sport in field.sports"
            :key="sport.sportName"
            class="q-mt-md"
          >
            <q-card-section class="row items-center justify-between">
              <div>
                <div class="text-subtitle1">{{ sport.sportName }}</div>
                <div>{{ sport.sportDescription }}</div>
              </div>
              <div>
                <q-btn
                  flat
                  icon="add"
                  @click="addSport(field)"
                  label="Add Package"
                />
                <q-btn flat icon="edit" @click="editSport(sport)" />
                <q-btn
                  flat
                  icon="delete"
                  @click="confirmDeleteSport(sport)"
                  color="negative"
                />
              </div>
            </q-card-section>

            <div v-for="pck in sport.packages" :key="pck.packageName">
              <q-card-section>
                <div class="text-caption">
                  {{ pck.packageName }} - {{ pck.price }}
                </div>
              </q-card-section>
            </div>
          </div>
          <q-card-section>
            <q-btn flat icon="add" @click="addSport(field)" label="Add Sport" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { IField, ISport, IPackage } from 'src/types/interfaces';
import { defineComponent, onMounted, ref } from 'vue';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  addDoc,
} from 'firebase/firestore';
import Swal from 'sweetalert2';

export default defineComponent({
  name: 'FieldsList',
  setup() {
    const fields = ref([] as IField[]);
    const showDialog = ref(false);
    const newField = ref({} as IField);
    const db = getFirestore();

    const loadFields = async () => {
      const fieldsCollection = collection(db, 'lapangan');
      const fieldsSnapshot = await getDocs(query(fieldsCollection));

      const fieldsPromises = fieldsSnapshot.docs.map(async (doc) => {
        const fieldData = doc.data();

        // Fetch sports for this field
        const sportsCollection = collection(db, `lapangan/${doc.id}/Sports`);
        const sportsSnapshot = await getDocs(query(sportsCollection));

        const sports = sportsSnapshot.docs.map((sportDoc) => {
          const sportData = sportDoc.data();
          return {
            sportId: sportDoc.id,
            sportName: sportData.sportName,
            sportDescription: sportData.sportDescription,
          };
        });

        return {
          fieldId: doc.id,
          fieldName: fieldData.fieldName,
          location: fieldData.location,
          facilities: fieldData.facilities, // Assuming facilities is an array in fieldData
          sports: sports,
        };
      });

      fields.value = await Promise.all(fieldsPromises);
    };

    const saveNewField = async () => {
      if (
        newField.value.fieldId &&
        newField.value.fieldName &&
        newField.value.location
      ) {
        await addDoc(collection(db, 'lapangan'), {
          fieldId: newField.value.fieldId,
          fieldName: newField.value.fieldName,
          location: newField.value.location,
        });
        showDialog.value = false;
        loadFields(); // Reload fields list
      }
    };

    const addSport = (field: IField) => {
      // Logic to open a dialog to add a sport to the field
    };

    const editSport = (sport: ISport) => {
      // Logic to open a dialog to edit the selected sport
    };

    const confirmDeleteSport = (sport: ISport) => {
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
          deleteSport(sport);
        }
      });
    };

    const deleteSport = async (sport: ISport) => {
      // Logic to delete the sport from Firestore
    };

    onMounted(loadFields);

    return {
      fields,
      newField,
      showDialog,
      saveNewField,
      addSport,
      editSport,
      confirmDeleteSport,
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
