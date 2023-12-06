<script lang="ts" setup>

</script>

<template>
  <div class="text-sm px-2 py-1 border border-secondary rounded mb-2 flex items-center gap-2" :="$attrs">
    <UIcon name="i-mdi-alert"></UIcon>
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>

</style>