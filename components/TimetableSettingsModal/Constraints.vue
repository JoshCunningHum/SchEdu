<script lang="ts" setup>

const timetableStore = useTimetableStore();
const settings = computed(() => timetableStore.selected?.data?.params.settings);

const mim = computed({
  get: () => settings.value?.max_instructor_minutes_per_day || 0,
  set: (v : number) => (settings.value === undefined) || (settings.value.max_instructor_minutes_per_day = v)
})
const msm = computed({
  get: () => settings.value?.max_student_minutes_per_day || 0,
  set: (v : number)  => (settings.value === undefined) || (settings.value.max_student_minutes_per_day = v)
})
const mrm = computed({
  get: () => settings.value?.max_room_minutes_per_day || 0,
  set: (v : number)  => (settings.value === undefined) || (settings.value.max_room_minutes_per_day = v)
})
const mcm = computed({
  get: () => settings.value?.max_consecutive_minutes || 0,
  set: (v : number)  => (settings.value === undefined) || (settings.value.max_consecutive_minutes = v)
})

</script>

<template>
  <div class="flex flex-col gap-2">

    <UFormGroup label="Max Instructor Minutes per Day"
      help="The highest amount of time (in minutes) instructors are permitted to spend in classes each day.">
      <UInput type="number"  class="w-[150px]" v-model="mim"/>
    </UFormGroup>

    <UFormGroup label="Max Students Minutes per Day"
      help="The highest amount of time (in minutes) students are permitted to spend in classes each day.">
      <UInput type="number"  class="w-[150px]" v-model="msm"/>
    </UFormGroup>

    <UFormGroup label="Max Room Minutes per Day"
      help="The highest amount of time (in minutes) rooms can be used for classes each day.">
      <UInput type="number"  class="w-[150px]" v-model="mrm"/>
    </UFormGroup>

    <UFormGroup label="Max Consecutive Minutes"
      help="The highest amount of time (in minutes) that instructors may spend in class uninterrupted.">
      <UInput type="number" class="w-[150px]" v-model="mcm" />
    </UFormGroup>

  </div>
</template>

<style lang="scss" scoped>

</style>