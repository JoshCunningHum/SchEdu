<script lang="ts" setup>
import type { Activity } from '~/types/Activity';
import { Day } from '~/types/DaySched';
import { Instructor } from '~/types/Instructor';


const customizerstore = useCustomizerStore();
const {
  courses, rooms, instructors, sections, activities,
  dragged, hovered, mode, selectedAct: selected, selectedPairs: pairs, previewAct: _act, displayed: current,
} = storeToRefs(customizerstore);
const {
  checkSched
} = customizerstore;

const instructor = computed(() => selected.value?.instructor(instructors.value));
const course = computed(() => selected.value?.course(courses.value));

const compat_teachers = computed(() => instructors.value.filter(i => !!course.value && i.compatible_courses.has(course.value)))



// Operation
const select = (a: Activity) => {
  customizerstore.selectedAct = a;
}

const setTeacher = (t: Instructor) => {
  if (!selected.value) return;

  // TODO: Do validation
  customizerstore.transfer(selected.value, t);
  pairs.value.forEach(a => customizerstore.transfer(a, t));
}

</script>

<template>
  <div class="poppins flex flex-col h-full min-h-0 p-2 overflow-y-auto scroll-stable ">
    <div class="py-1 text-xs text-secondary-em">Current Teacher</div>
    <div :class="`${!instructor ? 'warning' : ''} flex justify-between`">
      <!-- TODO: Put warning and notification -->
      <div>

        {{ instructor?.name || '[No Teacher]' }}

      </div>
    </div>
    <div class="py-1 text-xs text-secondary-em">Available Teachers</div>
    <div v-for="t in instructors">
      <div v-if="!instructor || t.id !== instructor.id" :class="`rounded-md flex gap-2 items-center border flex border-transparent ${dragged?.id === t.id ? 'draggedTarget' : ''
        }`">
        <UButton trailing-icon="i-mdi-chevron-right" :padded="false" variant="link" label="Set" @click="setTeacher(t)" />
        <div class="flex-grow flex max-w-[200px] justify-between">

          <span class="truncate text-sm">{{ t.name }}</span>

          <div class="flex gap-2">
            <UPopover mode="hover" v-if="!!selected">
              <span class="w-3 h-full flex items-center">

                <span v-if="checkSched(selected, t)" class="error flex items-center">
                  <UIcon name="i-mdi-alert" class="pulsating" />
                </span>

              </span>

              <template #panel>
                <div class="p-2 text-sm error">Schedule Conflict</div>
              </template>
            </UPopover>
            
            <UPopover mode="hover" v-if="!!course">
                <span class="w-3 h-full flex items-center">

                  <span v-if="!compat_teachers.find(i => i.id === t.id)" class="warning flex items-center">
                    <UIcon name="i-mdi-alert" class="pulsating" />
                  </span>

                </span>

                <template #panel>
                  <div class="p-2 text-sm warning">{{ t.name }} does not do {{ course.name }}</div>
                </template>
              </UPopover>

          </div>


        </div>
      </div>
    </div>

    <div class="py-1 text-xs text-secondary-em" v-if="pairs.length">Paired Sessions</div>
    <div v-for="a in pairs" class="flex gap-2 items-center">
      <UButton icon="i-mdi-chevron-right" :padded="false" variant="link" @click="select(a)" />
      <span>[{{ Day[a.sched] }}] {{ a.room(rooms)?.name || '[No Room]' }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/colors.scss";

// When dragging a teacher, this class is given to the same teacher in the available teachers list
.draggedTarget {
  @apply bg-accent;
}

.warning {
  @apply text-amber-500 ;
  font-weight: 400;
}

.error {
  @apply text-rose-500;
  font-weight: 400;
}
</style>