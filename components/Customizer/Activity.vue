<script lang="ts" setup>
import { Course, CourseArray } from '~/types/Course';
import { Instructor, InstructorArray } from '~/types/Instructor';
import { Room, RoomArray } from '~/types/Room';
import { Section, SectionArray } from '~/types/Section';
import { TimetableSettings } from '~/types/Timetable';


const customizerStore = useCustomizerStore();
const act = computed(() => customizerStore.selectedAct);

const timetableStore = useTimetableStore();
const data = computed(() => timetableStore.selected?.data?.sched);
const settings = computed(() => data.value?.settings);
const _default = new TimetableSettings();

// Parameters
const rooms = computed(() => data.value?.rooms || new RoomArray());
const instructors = computed(() => data.value?.instructors || new InstructorArray());
const sections = computed(() => data.value?.sections || new SectionArray());
const courses = computed(() => data.value?.courses || new CourseArray());

// Reactivity
const _course = computed(() => act.value?.courseID);
const course = ref<Course | undefined>();

const _room = computed(() => act.value?.roomID);
const room = ref<Room | undefined>();

const _instructor = computed(() => act.value?.instructorID);
const instructor = ref<Instructor | undefined>();

const _section = computed(() => act.value?.sectionID);
const section = ref<Section | undefined>();

// 

watchImmediate(_course, v => {
  if ((!!course.value && course.value.id === v)) return;
  course.value = courses.value.find(c => c.id === v);
})

watch(course, v => {
  if (!v || (!!_course.value && _course.value === v.id) || !act.value) return;
  act.value.courseID = v.id;

  // Perform Transfer
})

watchImmediate(_room, v => {
  if ((!!room.value && room.value.id === v)) return;
  room.value = rooms.value.find(c => c.id === v);
})

watch(room, v => {
  if (!v || (!!_room.value && _room.value === v.id) || !act.value) return;
  act.value.roomID = v.id;

  // Performa Transfer
})

watchImmediate(_instructor, v => {
  if ((!!instructor.value && instructor.value.id === v)) return;
  instructor.value = instructors.value.find(c => c.id === v);
})

watch(instructor, v => {
  if (!v || (!!_instructor.value && _instructor.value === v.id) || !act.value) return;
  act.value.instructorID = v.id;

  // Performa Transfer
})

watchImmediate(_section, v => {
  if ((!!section.value && section.value.id === v)) return;
  section.value = sections.value.find(c => c.id === v);
})

watch(section, v => {
  if (!v || (!!_section.value && _section.value === v.id) || !act.value) return;
  act.value.sectionID = v.id;

  // Performa Transfer
})


// Transfer Checks
const checkSched = customizerStore.checkSched;
const checkClasses = customizerStore.checkClasses;

const courseMeeting = computed(() => !!course.value ? course.value.weekly_meetings : 0);

</script>

<template>
  <div class="w-full h-full p-2 poppins flex flex-col gap-2" v-if="!!act">
    <div class="text-xs text-secondary-em flex justify-between">
      <span>{{ act.id }}</span>
      <span>{{ act.instance }}</span>
    </div>
    <div>
      <USelectMenu :options="courses" option-attribute="" :popper="{ placement: 'left-start' }" v-model="course">

        <template #label>
          <div>{{ course?.name }}</div>
        </template>

        <template #option="{ option }: { option: Course }">
          <div>{{ option.name }}</div>
        </template>

      </USelectMenu>
    </div>
    <div>
      <USelectMenu :options="rooms" option-attribute="" :popper="{ placement: 'left-start' }" v-model="room"
        :ui="{ option: { container: 'w-full', base: 'w-full' } }">

        <template #label>
          <div :class="`${!room ? 'error' : ''}`">{{ room?.name || 'No Room' }}</div>
        </template>

        <template #option="{ option }: { option: Room }">
          <div class="flex justify-between items-center w-full gap-2">

            <span>{{ option.name }}</span>

            <UPopover mode="hover">
              <span class="w-3 h-full flex items-center">

                <span v-if="checkSched(act, option)" class="text-rose-500 flex items-center">
                  <UIcon name="i-mdi-alert" />
                </span>

              </span>

              <template #panel>
                <div class="p-2 text-rose-500">Schedule Conflict</div>
              </template>
            </UPopover>

          </div>
        </template>

      </USelectMenu>
    </div>
    <div>
      <USelectMenu :options="instructors" option-attribute="" :popper="{ placement: 'left-start' }" v-model="instructor">

        <template #label>
          <div :class="`${!instructor ? 'error' : ''}`">{{ instructor?.name || '[No Instructor]' }}</div>
        </template>

        <template #option="{ option }: { option: Instructor }">
          <div class="flex justify-between items-center w-full gap-2">

            <span>{{ option.name }}</span>

            <UPopover mode="hover">
              <span class="w-3 h-full flex items-center">

                <span v-if="checkSched(act, option)" class="text-rose-500 flex items-center">
                  <UIcon name="i-mdi-alert" />
                </span>

              </span>

              <template #panel>
                <div class="p-2 text-rose-500">Schedule Conflict</div>
              </template>
            </UPopover>

          </div>
        </template>

      </USelectMenu>
    </div>
    <div>
      <USelectMenu :options="sections" option-attribute="" :popper="{ placement: 'left-start' }" v-model="section">

        <template #label>
          <div :class="`${!section ? 'error' : ''}`">{{ section?.id || '[No Section]' }}</div>
        </template>

        <template #option="{ option }: { option: Section, selected: boolean }">
          <div class="flex justify-between items-center w-full gap-2">

            <span>{{ option.id }}</span>

            <UPopover mode="hover">
              <span class="w-3 h-full flex items-center">

                <span v-if="checkSched(act, option)" class="text-rose-500 flex items-center">
                  <UIcon name="i-mdi-alert" />
                </span>

              </span>

              <template #panel>
                <div class="p-2 text-rose-500">Schedule Conflict</div>
              </template>
            </UPopover>

            <UPopover mode="hover">
              <span class="w-3 h-full flex items-center">

                <span 
                v-if="checkClasses(act, option) <= (act.sectionID === option.id ? -1 : 0)" 
                :class="`${checkClasses(act, option) < 0 ? 'text-red-500' : 'text-amber-500'} flex items-center`">
                  <UIcon name="i-mdi-alert" />
                </span>

              </span>

              <template #panel>
                <div :class="`p-2 ${checkClasses(act, option) < 0 ? 'text-red-500' : 'text-amber-500'}`">{{ course?.name }}: {{ courseMeeting - checkClasses(act, option) }} / {{ courseMeeting }}</div>
              </template>
            </UPopover>

          </div>
        </template>

      </USelectMenu>
    </div>
    <div>
      <UButton color="red" @click="customizerStore.remove(act)" block>Delete</UButton>
    </div>
    <!-- <SectionAlert class="text-red-500 mb-0" v-if="!act.sectionID">
      No Section
    </SectionAlert>
    <SectionAlert class="text-red-500 mb-0" v-if="!act.roomID">
      No Room
    </SectionAlert>
    <SectionAlert class="text-red-500 mb-0" v-if="!act.instructorID">
      No Instructor
    </SectionAlert> -->
  </div>
</template>

<style lang="scss" scoped>
.error {
  @apply text-red-500;
}
</style>