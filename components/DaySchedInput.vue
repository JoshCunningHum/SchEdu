<script lang="ts" setup>
import { Day, DaySched, DaySchedArray } from '~/types/DaySched';

const props = defineProps({
  scheds: {
    type: DaySchedArray,
    default: []
  }
})

const scheds = computed(() => props.scheds);
const chosenDay = ref<DaySched>(scheds.value[0]);

watch(() => scheds.value.id, v => {
  if(scheds.value.length === 0) return;
  chosenDay.value = scheds.value[0];
}, {immediate: true, deep: true})

const from = ref(0);
const to = ref(0);

watch(chosenDay, v => {
  if(v === null || v === undefined) return;
  from.value = v.period_start;
  to.value = v.period_end;
}, { immediate: true, deep: true});

watch(from, v => {
  chosenDay.value.period_start = v;
})
watch(to, v => {
  chosenDay.value.period_end = v;
})

</script>

<template>
  <div class="flex items-center gap-2 flex-wrap">
    <div class="border-r pr-2">
      
      <USelectMenu :options="scheds" v-model="chosenDay">
        <template #label>
          {{ Day[chosenDay.day] }}
        </template>

        <template #option="{option: sched}">
          <span>{{ Day[sched.day] }}</span>
        </template>
      </USelectMenu>

    </div>
    <div class="flex gap-2 items-center flex-wrap">
      
    <TimeInput v-model="from" /> 
    <UIcon name="i-mdi-arrow-right" class="text-lg" />
    <TimeInput v-model="to" /> 

    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>