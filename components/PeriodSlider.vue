<script lang="ts" setup>

const props = defineProps({
  min: {
    type: Number,
    default: 420
  },
  max: {
    type: Number,
    default: 1140
  },
  step: {
    type: Number,
    default: 15
  },
});

const minValue = computed(() => props.min);
const maxValue = computed(() => props.max);
const step = computed(() => props.step);

const from = ref(minValue.value);
const to = ref(maxValue.value);

watch(from, v => {
  if(v < minValue.value) from.value = minValue.value;
  if(v > to.value) from.value = to.value;
})

watch(to, v => {
  if(v > maxValue.value) to.value = maxValue.value;
  if(v < from.value) to.value = from.value;
})

</script>

<template>
  <div class="flex gap-1 py-2 ">
    <div class="border-y border-l border-white my-2 w-1.5">

    </div>
    
    <div class="w-full relative">
      <div class="flex gap-2 items-center">
        <div class="roboto text-sm w-[80px]">
          {{ useMinutesToTime(from) }}
        </div>
        <div class="flex-grow">
          <URange size="xs" :step="step" :min="minValue" :max="maxValue" v-model="from" :ui="{track: { background:'[&::-webkit-slider-runnable-track]:bg-gray-200 [&::-moz-range-track]:bg-gray-200 [&::-webkit-slider-runnable-track]:dark:bg-gray-800 [&::-moz-range-track]:dark:bg-gray-800'}}" />
        </div>
      
      </div>

      <div class="flex gap-2 items-center">
        <div class="roboto text-sm w-[80px]">
          {{ useMinutesToTime(to) }}
        </div>

          <div class="flex-grow">
            <URange size="xs" :step="step" :min="minValue" :max="maxValue" v-model="to" :ui="{track: { background:'[&::-webkit-slider-runnable-track]:bg-gray-200 [&::-moz-range-track]:bg-gray-200 [&::-webkit-slider-runnable-track]:dark:bg-gray-800 [&::-moz-range-track]:dark:bg-gray-800'}}" />
          </div>

      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>


</style>