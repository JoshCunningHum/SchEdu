<script lang="ts" setup>


const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  }
})

const emit = defineEmits(['update:modelValue']);

const isOpen = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
});

</script>

<template>
  <UModal v-model="isOpen" :fullscreen="true">
    <UCard
      :ui="{
        base: 'h-full flex flex-col',
        rounded: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        body: {
          base: 'grow',
          padding: 'p-0 sm:p-0'
        },
        header: {
          padding: 'px-3 py-2 sm:px-4'
        }
      }">

      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="jetbrainsmono">Customize</h3>
          <UButton color="gray" class="rounded-full" variant="ghost" icon="i-mdi-close" @click="isOpen = false" />
        </div>
      </template>

      <!-- Customizer Here -->
      <div class="flex h-full">
        <div class="min-w-[150px] max-w-52 bg-accent h-full">

        </div>
      </div>

    </UCard>
  </UModal>
</template>

<style lang="scss" scoped>

</style>