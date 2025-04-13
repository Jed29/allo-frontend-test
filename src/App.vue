<template>
  <v-app theme="dark">
    <v-main class="bg-background">
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  //
</script>

<style>
.v-application {
  background-color: var(--v-background-base) !important;
}

.v-card {
  background-color: var(--v-surface-base) !important;
}
</style>
