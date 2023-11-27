<script lang="ts" setup>

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  pages: {
    type: Number,
    default: 5
  }
});

if(props.pages < 1) throw new Error(`Pages shouldn't be less than 1`);

const emits = defineEmits<{
  (e: 'change', v: number) : void,
  (e: 'update:modelValue', v: number) : void
}>();

const settingStore = useTimetableSettingsStore();
const interval = computed(() => settingStore.settings?.interval || 1);

const index = ref(1);

const GetIndexFromValue = (v: number) => Math.floor(v / interval.value);

watch(interval, () => index.value = 1);
watch(() => props.modelValue, v => index.value = GetIndexFromValue(v));

const changeIndex = (v: number) => {
  if(v < 1) return;
  index.value = v;
  emits('change', v * interval.value);
  emits('update:modelValue', v * interval.value);
}

</script>

<template>
  <div class="w-full flex gap-1 select-none">
    
    <UButton size="xl" @click="(index > 1) && changeIndex(index - 1)" :padded="false" variant="link" icon="i-mdi-chevron-left" />

    <div class="flex-grow">

      <div>
        
        <UButton 
        v-for="i in pages"
        class="text-center justify-center"
        :style="`width: ${100 / pages}%`"
        :padded="false" 
        color="gray" 
        variant="link" 
        @click="changeIndex(index + (i - Math.ceil(pages / 2)))"
        :key="(index + i) - Math.ceil(pages / 2)">
          {{ (index + i) - Math.ceil(pages / 2) <= 0 ? '' : ((index + i) - Math.ceil(pages / 2)) * interval}}
        </UButton>
        
      </div>

    </div>

    <UButton size="xl" @click="changeIndex(index + 1)" :padded="false" variant="link" icon="i-mdi-chevron-right" />


  </div>
</template>

<style lang="scss" scoped>

</style>