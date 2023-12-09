<script lang="ts" setup>
import { _width } from '#tailwind-config/theme';
import { Activity } from '~/types/Activity';
import { Course, CourseArray } from '~/types/Course';
import { DaySched, DaySchedArray } from '~/types/DaySched';
import { InstructorArray } from '~/types/Instructor';
import { Room, RoomArray } from '~/types/Room';
import { SectionArray, Section } from '~/types/Section';
import { TimetableSettings } from '~/types/Timetable';

const props = defineProps({
  sched: {
    type: Array<DaySched>,
    required: true
  }
})

// Styles
const _bordercolor = 'border-gray-700';
const _actwidth = '70%';

// Stores
const customizerStore = useCustomizerStore();
const timetableStore = useTimetableStore();
const data = computed(() => timetableStore.selected?.data?.sched);
const settings = computed(() => data.value?.settings);
const _default = new TimetableSettings();

// Shared Data
const { 
  mode, hovered,
  primaryFilter, secondaryFilter,
  previewAct: _act
} = storeToRefs(customizerStore);


// Parameters
const rooms = computed(() => data.value?.rooms || new RoomArray());
const instructors = computed(() => data.value?.instructors || new InstructorArray());
const sections = computed(() => data.value?.sections || new SectionArray());
const courses = computed(() => data.value?.courses || new CourseArray());

// Sched Data
const start = computed(() => settings.value?.start || _default.start);
const end = computed(() => settings.value?.end || _default.end);
const duration = computed(() => end.value - start.value);
const interval = computed(() => settings.value?.interval || _default.interval);
const periods = computed(() => Array(duration.value / interval.value + 1).fill(0).map((v, i) => {
  const std = useMinutesToTime(i * interval.value + start.value);

  return {
    label: std.str,
    mins: std.mins,
    isPM: std.isPM,
    hrs: std.hrs,
    rhrs: std.rhrs,
    og: std.og
  }
}));

// Zooming and Height Calculations
const table = ref<InstanceType<typeof HTMLDivElement>>();

const zoomRaw = ref(100);
const zoomValue = computed(() => 101 - zoomRaw.value);
const minHeightPerHour = ref(75);
const maxHeightPerHour = computed(() => 150);
const heightPerHour = computed(() => (maxHeightPerHour.value - minHeightPerHour.value) * (zoomValue.value / 100) + minHeightPerHour.value);
const heightPerPeriod = computed(() => heightPerHour.value * (interval.value / 60));

const getPosition = (minutes: number, isStart: boolean = true): number => {
  if (isStart) minutes -= start.value;
  const applied_offset = isStart ? heightPerPeriod.value / 2 : 0;
  const periodsCovered = minutes / interval.value;
  return applied_offset + periodsCovered * heightPerPeriod.value;
}


// Dropping
const dragged = computed(() => customizerStore.dragged);
const displayed = computed(() => customizerStore.displayed);
const displayedSched = computed(() => props.sched);

const allow_course_drop = computed(() => {
  if(!_act.value || !displayedSched.value) return;

  const day = _act.value.sched;
  const sched = displayedSched.value[day - 1];

  return sched.activities.every(a => !_act.value || a.id === _act.value.id || !a.isConflict(_act.value));
})
// const allow_section_drop = computed(() => {
//   if(!displayedSched.value) return;
// })

watchImmediate(dragged, v => {
  if (!v){
    _act.value = undefined;
    primaryFilter.value = undefined;
    secondaryFilter.value = undefined;
  }else if (v instanceof Course) {
    // Create a new activity with that course ID and the current selected room
    _act.value = new Activity({
      start: 0,
      duration: v.minutesPersession,
      sched: 0,
      instance: 0,
      course: v.id
    })

    if(displayed.value instanceof Room) _act.value.roomID = displayed.value.id;
  }else if(v instanceof Section){
    // Create primary filter
    primaryFilter.value = v.scheds;
  }
})

const ondragover = (e: DragEvent) => {
  if (!_act.value) return;
  e.preventDefault();

  const target = e.target;
  if (!(target instanceof HTMLDivElement)) return;

  const start = parseInt(target.dataset.start || '0');
  const day = parseInt(target.dataset.day || '0');
  // Put identification for allowed and unallowed drops
  if (!!_act.value) {
    _act.value.start_time = start;
    // TODO: Make sure to also track all the section/instructor/room daysched array (since we are changing the day)
    _act.value.sched = day;
  }

  target.classList.add('over');
}

const ondragleave = (e: DragEvent) => {
  if (!dragged.value) return;
  e.preventDefault();
  const target = e.target;
  if (!(target instanceof HTMLDivElement)) return;
  target.classList.remove('over');
}

const ondragenter = (e: DragEvent) => {
  const target = e.target;
  if (!(target instanceof HTMLDivElement)) return;

}

const ondrop = (e: DragEvent) => {
  e.preventDefault();
  const target = e.target;
  if (!(target instanceof HTMLDivElement)) return;
  target.classList.remove('over');

  if(!_act.value || !props.sched || !allow_course_drop.value) return;

  if(!dragged.value){
    // Means that an activity is manually dragged
    customizerStore.remove(_act.value);
    customizerStore.selectedAct = _act.value;
  }

  // Do Checking Here
  customizerStore.add(_act.value);

  _act.value = undefined;
}

// Dragging on Activities


</script>

<template>
  <div class="flex-grow flex flex-col">

    <div class="header flex justify-center overflow-x-hidden items-center content-center scroll-stable">
      <div>Time</div>
      <div>Monday</div>
      <div>Tuesday</div>
      <div>Wednesday</div>
      <div>Thursday</div>
      <div>Friday</div>
      <div>Saturday</div>
    </div>

    <div class="scroll-stable min-h-0 overflow-y-auto flex-grow">
      <div class="h-full flex container" ref=table>

        <!-- Time -->
        <div>
          <div v-for="p in periods" :key="p.label" :style="`height: ${heightPerPeriod}px;`"
            class="flex justify-center items-center content-center jetbrainsmono">
            <UDivider :label="p.label" :ui="{
              border: {
                base: `${_bordercolor} dark:${_bordercolor}`,
              },
              label: 'text-xs'
            }" />
          </div>
        </div>

        <!-- Day Sched Array -->
        <div v-for="i in 6" :key="i" :class="`relative`">
          <!-- Lines -->
          <div v-for="p in periods" :key="p.label" :style="`height: ${heightPerPeriod}px`"
            class="flex justify-center items-center content-center">
            <UDivider :ui="{
              border: {
                base: `${_bordercolor} dark:${_bordercolor}`,
              },
              label: 'text-xs'
            }" />
          </div>

          <!-- Primary Filter (Section) -->
          <template v-if="!!primaryFilter">
            <div v-for="a in primaryFilter[i - 1].activities"
            :style="`top: ${getPosition(a.start_time) - 1}px; height: ${getPosition(a.duration, false) + 1}px;`"
            class="bg-opacity-50 bg-red-600 absolute pointer-events-none mx-auto left-0 right-0">
            </div>
          </template>

          <!-- Secondary Filter (Instructor) -->
          <template v-if="!!secondaryFilter">
            <div v-for="a in secondaryFilter[i - 1].activities"
            :style="`top: ${getPosition(a.start_time) - 1}px; height: ${getPosition(a.duration, false) + 1}px;`"
            class="bg-opacity-20 bg-yellow-500 absolute pointer-events-none mx-auto left-0 right-0">
            </div>
          </template> 

          <!-- Activity Drop Preview -->
          <template v-if="!!_act && _act.sched === i">
            <div :class="`activity z-30 ${allow_course_drop ? '' : 'not-allowed'}` "
              :style="`width: ${_actwidth}; top: ${getPosition(_act.start_time) - 1}px; height: ${getPosition(_act.duration, false) + 1}px; pointer-events: none;`">

              <span class="text-center">
                {{ _act.course(courses)?.name }}
                -
                <span class=" whitespace-nowrap">{{ _act.section(sections)?.id || '[No Section]' }}</span>
              </span>
              <span>
                {{ _act.instructor(instructors)?.name || `[No Instructor]` }}
              </span>
              <span>
                {{ _act.room(rooms)?.name || `[No Room]` }}
              </span>


            </div>
          </template>
          

          <!-- Drop Handlers Here -->
          <div v-for="p in periods" :key="p.label"
            :style="`height: ${heightPerPeriod}px; top: ${getPosition(p.og) - 1}px`" :class="`w-full absolute drops ${!!dragged ? 'z-20' : 'z-0'}`"
            :data-start="p.og" :data-day="i" @dragover="ondragover" @dragleave="ondragleave" @dragenter="ondragenter"
            @drop="ondrop" :draggable="false">
          </div>

          <!-- DaySched Data Here -->
          <template v-if="!!sched && sched.length > i - 1 && !!sched[i - 1]">

            <CustomizerSession v-for="a in sched[i - 1].activities" :act="a" :key="a.id" 
            :style="`width: ${_actwidth}; top: ${getPosition(a.start_time) - 1}px; height: ${getPosition(a.duration, false) + 1}px;`"/>

          </template>

        </div>

      </div>
    </div>

  </div>

  <div class="w-4 h-full border-l border-secondary py-2">
    <VerticalSlider v-model="zoomRaw" />
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/colors.scss";

.drops {
  &.over {
    // @apply border border-dashed;
  }
}

.activity {
  @apply absolute flex bg-primary items-center justify-center border border-accent text-xs flex-col mx-auto cursor-pointer left-0 right-0;


  &.not-allowed{
    @apply bg-rose-600 border-primary;
  }

  &.hovered{
    @apply bg-secondary;
    &.selected {
      @apply bg-green-300;
    }
  }

  &.selected {
    @apply bg-accent;
  }

  &.lacking{
    @apply bg-amber-600 border-amber-600;

    &.selected {
      @apply bg-amber-700 text-white;
    }
  }

  span {
    @apply select-none;
  }

  font-family: 'Poppins';
}

.header {
  @apply flex overflow-x-hidden border-b border-secondary;

  flex-shrink: 0;

  &>div {
    @apply h-full w-full text-center -ml-px text-xs py-1 flex items-center justify-center;

    &:first-child {
      margin-left: 0;
    }

    font-family: "Poppins";
    font-weight: 300;
  }
}

.container>div {
  @apply flex-grow -mt-px -ml-px w-full h-full;

  &:first-child {
    margin-left: 0;
  }
}
</style>