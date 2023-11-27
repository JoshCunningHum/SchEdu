<script setup lang="ts">

const appConfig = useAppConfig();
console.log(appConfig.ui);

</script>

<template>
  <NuxtLayout class="h-full">
      <NuxtPage />
  </NuxtLayout>
</template>

<style>
</style>