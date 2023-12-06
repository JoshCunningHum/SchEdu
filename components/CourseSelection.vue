<script lang="ts" setup>
import { Course, CourseArray } from '~/types/Course';
import type { RoomType } from '~/types/Room';

const props = defineProps({
  modelValue: {
    type: CourseArray,
    required: true
  },
  copies: {
    type: Array<{ label: string, courses: CourseArray }>
  }
})

const settings = useTimetableSettingsStore();
const courseStore = useCourseStore();

const roomTypes = computed(() => settings.roomTypes);
const courses = computed(() => courseStore.courses);

// Columns
const columns = [{
  key: 'name',
  label: 'Name',
  sortable: true
}, {
  key: 'minutes',
  label: 'Session Duration',
  sortable: true
}, {
  key: 'weekly_meetings',
  label: 'Meetings/Week',
  sortable: true
}, {
  key: 'compatible_rooms',
  label: 'Room Types',
}];

const selectedCourses = ref<Array<Course>>([...props.modelValue]);

onUpdated(() => {
  selectedCourses.value.splice(0);
  selectedCourses.value.push(...props.modelValue);
});

const roomTypeFilter = ref<Array<RoomType>>([]);
const search = ref('');

const coursesFiltered = computed(() => {
  if (!courses.value) return courses.value;
  return courses.value.filter(c => (roomTypeFilter.value.length === 0 || c.compatible_rooms.hasAny(roomTypeFilter.value)) && (search.value === '' || c.name.includes(search.value)));
})

const select = (row: Course) => {
  const i = selectedCourses.value.findIndex(c => c.equals(row));
  if (i === -1) {
    selectedCourses.value.push(row);
    props.modelValue.push(row);
  } else {
    selectedCourses.value.splice(i, 1);
    props.modelValue.splice(i, 1);
  }
}

const copy = (cs: CourseArray) => {
  selectedCourses.value.splice(0);
  selectedCourses.value.push(...cs);
  props.modelValue.splice(0);
  props.modelValue.push(...cs);
}

</script>

<template>
  <!-- Action and Filters -->
  <div class="flex justify-between">
    <div class="flex gap-1">
      <UInput icon="i-mdi-search" v-model="search" placeholder="Search..." />
      <div class="w-[175px]">

        <USelectMenu searchable :search-attributes="['name']" multiple :options="roomTypes" v-model="roomTypeFilter">

          <template #label>
            <span v-if="roomTypeFilter.length" class="flex items-center -space-x-1">

              <span v-for="types in roomTypeFilter" :key="types.id" :style="`background: ${types.color};`"
                class="flex-shrink-0 w-2 h-2 mt-px rounded-full"></span>

              <span class="pl-3">
                {{ roomTypeFilter.length }} Selected
              </span>
            </span>
            <span v-else class="text-secondary-em text-sm">
              Filter Room Types
            </span>
          </template>

          <template #option="{ option: type }">
            <span :style="`background: ${type.color};`" class="inline-block h-2 w-2 flex-shrink-0 rounded-full"></span>
            <span class="truncate">{{ type.name }}</span>
          </template>

          <template #option-empty="{ query }">
            Not Found
          </template>

        </USelectMenu>

      </div>
      <UButton @click="() => (search = '') || (roomTypeFilter.splice(0))" v-if="!!search || roomTypeFilter.length" color="white">Reset</UButton>
    </div>
    <div v-if="!!copies && copies.length">
      <UPopover :popper="{ offsetDistance: 10, placement: 'bottom-end' }">

        <UButton color="white" label="Copy From" trailing-icon="i-mdi-chevron-down" />

        <template #panel>
          <div class="flex flex-col p-1 gap-1">
            <UButton class="w-[175px]" color="gray" @click="copy(c.courses)" v-for="c in copies" :key="c.label"
              variant="link">
              {{ c.label }}
            </UButton>
          </div>
        </template>

      </UPopover>
    </div>
  </div>

  <div class="flex w-full flex-grow min-h-0 overflow-y-auto scroll-stable">

    <!-- TODO: Minify Meetings/Week and Session Duration-->
    <!-- Table -->
    <UTable v-model="selectedCourses" :rows="coursesFiltered" :columns="columns" class="w-full flex-grow flex flex-col"
      :ui="{
        thead: 'sticky top-0 bg-gray z-10'
      }" @select="select" sort-asc-icon="i-heroicons-arrow-up" sort-desc-icon="i-heroicons-arrow-down" by="id">

      <template #compatible_rooms-data="{ row }">

        <UPopover mode="hover" :popper="{ placement: 'right' }">

          <div class="">


            <span v-if="row.compatible_rooms.length" class="flex items-center -space-x-1">

              <span v-for="types in row.compatible_rooms" :key="types.id" :style="`background: ${types.color};`"
                class="flex-shrink-0 w-2 h-2 mt-px rounded-full border"></span>

              <span class="pl-3">
                {{ row.compatible_rooms.length }} Selected
              </span>
            </span>
            <span v-else class="text-secondary-em text-sm">
              No Compatible Rooms
            </span>

          </div>

          <template #panel>
            <div v-if="row.compatible_rooms && row.compatible_rooms.length"
              class="px-2 py-1 flex flex-col gap-1 border border-secondary-em rounded-md">
              <div v-for="r in row.compatible_rooms" class="text-xs text-secondary-em">
                - {{ r.name }}
              </div>
            </div>
          </template>

        </UPopover>


      </template>

    </UTable>

  </div>
</template>

<style lang="scss" scoped></style>