<script lang="ts" setup>
import type { _periodFormat } from '~/composables/useMinutesToTime';
import type { TimetableSettings } from '~/types/Timetable';

const timetableStore = useTimetableStore();
const settings = computed<TimetableSettings | undefined>(() => timetableStore.selected?.data?.params.settings);

const p_start = computed({
  get: () => settings.value?.start || 0,
  set: v => (settings.value !== undefined) && (settings.value.start = v)
});

const p_end = computed({
  get: () => settings.value?.end || 0,
  set: v => (settings.value !== undefined) && (settings.value.end = v)
});

const p_durationFormat = computed(() => useMinutesToTime(p_end.value - p_start.value));

const periods = ref<Array<_periodFormat>>([]);

const intervalValues = [15, 30, 60, 120, 240];

const intervalIndex = ref(0);

watch(intervalIndex, v => interval.value = intervalValues[intervalIndex.value]);

const interval = computed({
  get: () => settings.value?.interval || 0,
  set: v => (settings.value !== undefined) && (settings.value.interval = v)
});
onMounted(() => {
  // Set interval index first
  const i = intervalValues.findIndex(v => v === interval.value);
  if(i !== -1) intervalIndex.value = i;
})


const include_sat = computed({
  get: () => settings.value?.include_sat || false,
  set: v => (settings.value !== undefined) && (settings.value.include_sat = v)
})

const excluded = computed<Array<_periodFormat>>({
  get: (): Array<_periodFormat> => settings.value?.excluded_periods.map(v => useMinutesToTime(v)) || [],
  set: (v: Array<_periodFormat>) => {
    settings.value?.excluded_periods.splice(0);
    settings.value?.excluded_periods.push(...(new Set(v.map(p => p.og))));
  }
});

const numOfPeriods = computed(() => interval.value <= 0 ? 0 : Math.floor((p_end.value - p_start.value) / interval.value))

watch(numOfPeriods, v => {
  periods.value.splice(0);
  Array(v).fill(0).forEach((v, i) => {
    const p = p_start.value + interval.value * i;
    periods.value.push(useMinutesToTime(p));
  });
}, { immediate: true })

const removeExclusive = (og : number) => {
  if(settings.value === undefined) return;
  const i = settings.value.excluded_periods.findIndex(v => v === og);
  if(i !== -1) settings.value.excluded_periods.splice(i, 1);
  excluded.value = settings.value.excluded_periods.map(v => useMinutesToTime(v)) || [];
}

</script>

<template>
  <div class="flex flex-col flex-grow gap-1 h-full min-h-0">
    
    <SectionAlert>
      Changing the period requires you to edit all teacher and room periods.
    </SectionAlert>

    <UFormGroup
      :error="p_durationFormat.og % interval !== 0 && 'Period Duration is not divisible by the interval'">
      
      <div class="flex gap-4">
        <UFormGroup label="Period Start">
          <TimeInput v-model="p_start" />
        </UFormGroup>
        <UFormGroup label="Period End">
          <TimeInput v-model="p_end" />
        </UFormGroup>
      </div>

    </UFormGroup>
    <UFormGroup :label="`Period Duration: ${p_durationFormat.rhrs > 0 ? p_durationFormat.rhrs + ' hrs' : ''} ${p_durationFormat.mins > 0 ? p_durationFormat.mins + ' mins' : ''}`">
    </UFormGroup>

    <SectionAlert>
      Changing interval requires you to re-input duration values in each courses
    </SectionAlert>

    <div class="w-full flex gap-2">

      <UFormGroup label="Interval">
        <div class="flex gap-2 items-center">
          <div class="text-sm">{{ interval }} mins</div>
          <URange :min="0" :max="4" class="w-[150px]" v-model="intervalIndex" size="xs" />
          <div class="text-sm">{{ numOfPeriods }} Periods</div>
        </div>
      </UFormGroup>

    </div>

    <UFormGroup label="Excluded Periods">
    </UFormGroup>

    <div class="flex-grow w-full flex gap-2 min-h-0">

      <div class="flex flex-col flex-grow max-w-fit overflow-y-auto gap-1 min-h-0">
        <div v-for="p in excluded" :key="p.str" class="jetbrainsmono flex justify-between w-32 p-1 px-2 bg-accent items-center rounded">
          <span class="text-accent-em font-bold">{{ p.str }}</span>
          <span @click="removeExclusive(p.og)" class="flex cursor-pointer items-center"><UIcon name="i-mdi-close"/></span>
        </div>
        <div v-if="excluded.length === 0" class="text-center w-32 text-sm text-secondary-em py-1 ">
          No Period Exlusions
        </div>
      </div>

      <div class="w-40">
        <USelectMenu 
        :search-attributes="['str']"
        :options="periods" 
        multiple 
        v-model="excluded" 
        searchable
        :popper="{ offsetDistance: 0 }">
          <template #option="{ option: period }">
            <div class="flex items-center justify-between w-full">
              
              <span>{{ period.str }}</span>
              <span v-if="excluded.some(p => p.og === period.og)" class="pl-5">
                <UIcon name="i-mdi-check"></UIcon>
              </span>

            </div>
          </template>
        </USelectMenu>
      </div>


    </div>
  </div>
</template>

<style lang="scss" scoped></style>