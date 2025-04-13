<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-btn
          color="primary"
          variant="text"
          @click="$router.push('/')"
          class="mb-4"
        >
          <v-icon start>mdi-arrow-left</v-icon>
          Back to List
        </v-btn>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-row v-else-if="error">
      <v-col cols="12" class="text-center">
        <v-alert type="error" class="mb-4">
          {{ error }}
        </v-alert>
        <v-btn color="primary" @click="fetchRocket">Retry</v-btn>
      </v-col>
    </v-row>

    <!-- Success State -->
    <template v-else-if="rocket">
      <v-row>
        <v-col cols="12" md="6">
          <v-img
            :src="rocket.flickr_images[0]"
            height="400"
            cover
            class="rounded-lg"
          >
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
              </v-row>
            </template>
          </v-img>
        </v-col>
        <v-col cols="12" md="6">
          <h1 class="text-h4 mb-4">{{ rocket.name }}</h1>
          <p class="text-body-1 mb-6">{{ rocket.description }}</p>
          
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-currency-usd</v-icon>
              </template>
              <v-list-item-title>Cost per Launch</v-list-item-title>
              <v-list-item-subtitle>${{ formatNumber(rocket.cost_per_launch) }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-earth</v-icon>
              </template>
              <v-list-item-title>Country</v-list-item-title>
              <v-list-item-subtitle>{{ rocket.country }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-calendar</v-icon>
              </template>
              <v-list-item-title>First Flight</v-list-item-title>
              <v-list-item-subtitle>{{ formatDate(rocket.first_flight) }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRocketStore } from '@/stores/rocket'
import type { Rocket } from '@/types/rocket'

const route = useRoute()
const rocketStore = useRocketStore()

const loading = ref(false)
const error = ref('')
const rocket = ref<Rocket | null>(null)

const fetchRocket = async () => {
  loading.value = true
  error.value = ''
  try {
    const rocketId = route.params.id as string
    await rocketStore.fetchRocket(rocketId)
    rocket.value = rocketStore.currentRocket
  } catch (err) {
    error.value = 'Failed to fetch rocket details. Please try again.'
  } finally {
    loading.value = false
  }
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num)
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchRocket()
})
</script> 