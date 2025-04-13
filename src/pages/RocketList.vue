<template>
  <v-container>
    <v-row>
      <v-col class="d-flex justify-space-between align-center mb-4" cols="12">
        <h1 class="text-h4">Rocket List</h1>
        <v-btn
          color="primary"
          class="ml-auto"
          @click="showAddRocketDialog = true"
        >
          Add New Rocket
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col class="mb-4" cols="12" md="4">
        <v-text-field
          v-model="searchQuery"
          class="mb-4"
          label="Search rockets"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          bg-color="surface"
          clearable
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row v-if="isLoading">
      <v-col class="text-center" cols="12">
        <v-progress-circular
          color="primary"
          indeterminate
        ></v-progress-circular>
      </v-col>
    </v-row>

    <v-row v-else-if="errorMessage">
      <v-col class="text-center" cols="12">
        <v-alert type="error" class="mb-4">
          {{ errorMessage }}
        </v-alert>
        <v-btn color="primary" @click="loadRockets">Retry</v-btn>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col
        v-for="rocket in filteredRockets"
        :key="rocket.id"
        class="d-flex"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          class="d-flex flex-column rocket-card"
          width="100%"
          height="100%"
          hover
          elevation="2"
          @click="navigateToDetail(rocket.id)"
        >
          <v-img
            :src="rocket.flickr_images[0]"
            class="flex-grow-0"
            height="200"
            cover
          >
            <template #placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular
                  color="grey-lighten-5"
                  indeterminate
                ></v-progress-circular>
              </v-row>
            </template>
          </v-img>
          <v-card-title class="text-h6 pt-4">{{ rocket.name }}</v-card-title>
          <v-card-text class="flex-grow-1">
            <p class="text-truncate-3-lines">{{ rocket.description }}</p>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              class="ml-2"
              color="primary"
              variant="tonal"
              @click.stop="navigateToDetail(rocket.id)"
            >
              View Details
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog 
      v-model="showAddRocketDialog" 
      max-width="500"
      scrim="black"
      transition="dialog-transition"
    >
      <v-card class="rounded-lg" color="surface" elevation="8">
        <v-card-title class="text-h5 px-6 py-4 bg-primary text-white">Add New Rocket</v-card-title>
        <v-card-text class="px-6 py-4 bg-surface">
          <v-form ref="form" @submit.prevent="handleSubmit" class="mt-4">
            <v-text-field
              v-model="rocketForm.name"
              class="mb-4"
              label="Rocket Name"
              variant="outlined"
              bg-color="surface"
              required
              :rules="[(v) => !!v || 'Name is required']"
            ></v-text-field>
            <v-textarea
              v-model="rocketForm.description"
              class="mb-4"
              label="Description"
              variant="outlined"
              bg-color="surface"
              required
              :rules="[(v) => !!v || 'Description is required']"
            ></v-textarea>
            <v-text-field
              v-model="rocketForm.country"
              label="Country"
              class="mb-4"
              variant="outlined"
              bg-color="surface"
              required
              :rules="[(v) => !!v || 'Country is required']"
            ></v-text-field>
            <v-text-field
              v-model.number="rocketForm.cost_per_launch"
              class="mb-4"
              label="Cost per Launch"
              type="number"
              variant="outlined"
              bg-color="surface"
              required
              prefix="$"
              :rules="[(v) => !!v || 'Cost per launch is required']"
            ></v-text-field>
            <v-text-field
              v-model="rocketForm.flickr_images"
              class="mb-2"
              label="Image URL"
              variant="outlined"
              bg-color="surface"
              required
              :rules="[(v) => !!v || 'Image URL is required', validateImageUrl]"
              hint="Enter a valid image URL (e.g., https://example.com/image.jpg)"
              persistent-hint
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="px-6 py-4">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn 
            color="primary" 
            @click="handleSubmit"
            :loading="isLoading"
          >
            Add Rocket
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useRocketStore } from "@/stores/rocket";
import type { Rocket } from "@/types/rocket";
import type { VForm } from "vuetify/components";

const router = useRouter();
const rocketStore = useRocketStore();
const form = ref<VForm | null>(null);

const errorMessage = ref("");
const searchQuery = ref("");
const showAddRocketDialog = ref(false);

const isLoading = computed(() => rocketStore.$state.loading);

interface RocketForm {
  name: string;
  description: string;
  country: string;
  cost_per_launch: number;
  flickr_images: string;
}

const rocketForm = ref<RocketForm>({
  name: "",
  description: "",
  country: "",
  cost_per_launch: 0,
  flickr_images: "",
});

const validateImageUrl = (url: string): boolean | string => {
  try {
    new URL(url);
    return (
      url.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null ||
      "Please enter a valid image URL"
    );
  } catch {
    return "Please enter a valid URL";
  }
};

const filteredRockets = computed(() => {
  if (!searchQuery.value) return rocketStore.allRockets;
  const query = searchQuery.value.toLowerCase();
  return rocketStore.allRockets.filter(
    (rocket) =>
      rocket.name.toLowerCase().includes(query) ||
      rocket.description.toLowerCase().includes(query)
  );
});

const loadRockets = async () => {
  errorMessage.value = "";
  try {
    await rocketStore.fetchRockets();
  } catch {
    errorMessage.value = "Failed to fetch rockets. Please try again.";
  }
};

const navigateToDetail = (id: string): void => {
  router.push(`/rocket/${id}`);
};

const handleSubmit = async (): Promise<void> => {
  if (!form.value?.validate()) return;

  const rocket: Rocket = {
    id: Date.now().toString(),
    ...rocketForm.value,
    flickr_images: [rocketForm.value.flickr_images],
    first_flight: new Date().toISOString().split("T")[0],
  };

  await rocketStore.addRocket(rocket);
  closeDialog();
};

const closeDialog = (): void => {
  showAddRocketDialog.value = false;
  rocketForm.value = {
    name: "",
    description: "",
    country: "",
    cost_per_launch: 0,
    flickr_images: "",
  };
  if (form.value) {
    form.value.reset();
  }
};

onMounted(loadRockets);
</script>

<style scoped>
.text-truncate-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rocket-card {
  transition: transform 0.2s;
}

.rocket-card:hover {
  transform: translateY(-4px);
}
</style>
