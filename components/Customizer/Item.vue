<script lang="ts" setup>
import { ActivityArray } from '~/types/Activity';
import { Course, CourseArray } from '~/types/Course';
import { Instructor } from '~/types/Instructor';
import { Room, RoomArray } from '~/types/Room';
import { Section, SectionArray } from '~/types/Section';
import { Day } from '~/types/DaySched';
import { get } from '@vueuse/core';

const props = defineProps({
  item: {
    type: [Section, Instructor, Course],
    required: true
  },
  filter: {
    type: String
  }
})

// Store
const customizerStore = useCustomizerStore();
const timetableStore = useTimetableStore();
const sched = computed(() => timetableStore.selected?.data?.sched);

const { 
  courses, rooms, instructors, sections, activities
} = storeToRefs(customizerStore);

// Item Details

const item = computed<Instructor | Section | Course>(() => props.item);
const f = computed(() => props.filter?.toLowerCase() || '')
const show = computed(() => !!item.value && (!props.filter ||
  (item.value instanceof Section ? item.value.id.toLowerCase().includes(f.value) : item.value.name.toLowerCase().includes(f.value))));

// Statistics

// Course
const course_offers = (c: Course): number => {
  const minutesPerWeek = c.minutes;

  const offered = sections.value.reduce((acc, s) => acc += (s.section_courses.some(co => co.equals(c)) ? 1 : 0), 0);
  return minutesPerWeek * offered / 60;
}

const offers_left = (c: Course): number => {
  const offers = course_offers(c);
  // Loop through all room activities and count all activities with course id same as the parameter
  const count = activities.value.filter(a => a.courseID === c.id).reduce((acc, a) => acc += a.duration , 0);
  return offers - (count / 60);
}

const section_activities = (s: Section) => activities.value.filter(a => a.sectionID === s._id);

const non_following = (c: Course) : {section: Section, hrs: number, hrsW: number}[] => {
  const arr : {section: Section, hrs: number, hrsW: number}[] = [];
  const { minutes: minutesPerWeek } = c;
  const hrsPerWeek = minutesPerWeek / 60;

  // Loop through all the section activities and get their total duration of this course
  get(sections).forEach(s => arr.push({section: s, hrs: hrsPerWeek - (section_activities(s).reduce((acc, a) => acc += (a.courseID === c.id ? a.duration : 0), 0) / 60), hrsW: hrsPerWeek}));
  return arr;
}

const lacking_sections = (c: Course) : {section: Section, hrs: number, hrsW: number}[] => {
  return non_following(c).filter(s => s.hrs > 0)
}

const exceeding_sections = (c: Course) : {section: Section, hrs: number, hrsW: number}[] => {
  return non_following(c).filter(s => s.hrs < 0)
}

const cov = computed(() => item.value instanceof Course ? course_offers(item.value) : 0);
const olv = computed(() => item.value instanceof Course ? offers_left(item.value) : 0);

const lsc = computed(() => item.value instanceof Course ? lacking_sections(item.value) : []);
const esc = computed(() => item.value instanceof Course ? exceeding_sections(item.value) : []);

const c_sections = computed(() => {
  if (!(item.value instanceof Course)) return [];
  return sections.value.filter(s => s.section_courses.some(c => c.id));
})

// Sections

const section_classes = (s: Section) => {
  return s.section_courses.map(c => {
    return {
      meetings: c.minutes / 60,
      count: 0, // To be modified in section actual
      course: c.name,
      id: c.id
    }
  })
}

const section_actual_classes = (s: Section) => {
  const sas = section_activities(s);

  const classes = section_classes(s);
  classes.forEach(stat => {
    stat.count = sas.reduce((acc, a) => acc += (a.courseID === stat.id ? a.duration/60 : 0), 0);
  })

  return classes;
}

const sac = computed(() => item.value instanceof Section ? section_actual_classes(item.value) : undefined);

// Instructors

const checkSched = customizerStore.checkSched;

// Error and Warnings

const schedConflicts = computed(() => {
  if (!(item.value instanceof Section) && 
    !(item.value instanceof Instructor)) return [];

  const conflicts = item.value.scheds.getConflicts().filter(g => Array.isArray(g));

  return conflicts;
})

const errors = computed(() => {

  if (item.value instanceof Course) {
    return olv.value < 0;
  } else if (item.value instanceof Section) {
    return !!sac.value && sac.value.some(stat => stat.count > stat.meetings) ||
      schedConflicts.value.length > 0;
  } else if (item.value instanceof Instructor) {
    return schedConflicts.value.length > 0;
  }

  return false;
})

const warnings = computed(() => {

  if (item.value instanceof Course) {
    return olv.value > 0;
  } else if (item.value instanceof Section) {
    return !!sac.value && sac.value.some(stat => stat.count < stat.meetings);
  }

  return false;
})

// Dragging

const el = ref<InstanceType<typeof HTMLDivElement>>();

const ondragstart = (event: DragEvent) => {
  if (!el.value) return;
  el.value.classList.add('dragging');

  if (!(item.value instanceof Course) && !(item.value instanceof Section) && !(item.value instanceof Instructor)) return;
  customizerStore.draggedEl = el.value;
  customizerStore.dragged = item.value;
}

const ondragend = (event: DragEvent) => {
  if (!el.value) return;
  el.value.classList.remove('dragging');

  customizerStore.draggedEl = undefined;
  customizerStore.dragged = undefined;
}

// Hovering

const onmouseover = (e: MouseEvent) => {
  if (!(item.value instanceof Course) && !(item.value instanceof Section)) return;
  customizerStore.hovered = item.value;
}

const onmouseleave = (e: MouseEvent) => {
  if (!(item.value instanceof Course) && !(item.value instanceof Section)) return;
  customizerStore.hovered = undefined;
}

</script>

<template>
  <div class="item" v-if="show" ref="el">

    <div class="flex justify-between items-center w-full px-2 py-1.5 "
      :class="`${errors ? 'error' : warnings ? 'warning' : ''}`" :draggable="true" @dragstart="ondragstart"
      @dragend="ondragend" @mouseover="onmouseover" @mouseleave="onmouseleave">

      <!-- Section Special -->
      <template v-if="(item instanceof Section) && (!filter || item.id.includes(filter))">
        <span>{{ item.id }} - {{ useOrdinalize(item.year_level) }} Year</span>
      </template>
      <!-- Course and Room Special -->
      <template v-else-if="!!item && !(item instanceof Section)">
        <span>{{ item.name }}</span>
      </template>


      <UPopover mode="hover" :popper="{ placement: 'right', offsetDistance: 25 }" :ui="{}">

        <div>

          <span v-if="(item instanceof Course)">
            {{ olv || '' }}
          </span>
          <span v-else-if="(item instanceof Section) && (warnings || errors)">
            <UIcon name="i-mdi-alert" class="pulsating" />
          </span>
          <span v-else-if="(item instanceof Instructor) && (warnings || errors)">
            <UIcon name="i-mdi-alert" class="pulsating" />
          </span>

        </div>


        <template #panel>
          <div class="px-2 py-1 text-xs tracking-wider">

            <div class="warning">
              <div v-if="olv > 0">
                <div>Lacking assignments: {{ cov - olv }}hr / {{ cov }}hr</div>
              </div>
              <div v-for="stat in lsc" :key="stat.section.id">
                <div>{{ stat.section.id }}: {{ stat.hrsW - stat.hrs }}hr / {{ stat.hrsW }}hr</div>
              </div>

              <div v-if="!!sac && sac.some(stat => stat.count < stat.meetings)">
                <div>Lacking course assignments</div>
                <div v-for="stat in sac">
                  <div v-if="stat.count < stat.meetings">
                    - {{ stat.course }}: {{ stat.count }}hr / {{ stat.meetings }}hr
                  </div>
                </div>
              </div>
            </div>

            <div class="error">
              <div v-if="olv < 0">
                <div>Exceeding assignments: {{ cov - olv }}hr / {{ cov }}hr</div>
              </div>
              <div v-for="stat in esc" :key="stat.section.id">
                <div>{{ stat.section.id }}: {{ stat.hrsW - stat.hrs }}hr / {{ stat.hrsW }}hr</div>
              </div>

              <div v-if="!!sac && sac.some(stat => stat.count > stat.meetings)">
                <div>Exceeded course assignments</div>
                <div v-for="stat in sac">
                  <div v-if="stat.count > stat.meetings">
                    - {{ stat.course }}: {{ stat.count }}hr / {{ stat.meetings }}hr
                  </div>
                </div>
              </div>

              <div v-if="schedConflicts.length > 0">
                <div>Schedule Conflict</div>
                <div v-for="(group, groupI) in schedConflicts" :key="groupI">
                  - ({{ Day[group[0].sched] }})
                  <span v-for="act in group" :key="act.id" class="dashify">
                    {{ act.course(courses)?.name }} [{{ act.room(rooms)?.name }}]
                  </span>
                </div>
              </div>
            </div>

          </div>
        </template>

      </UPopover>

    </div>

  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/colors.scss";

.comafy+.comafy::before {
  content: ', ';
}

.dashify+.dashify::before {
  content: ' - ';
}
.pulsating{
	box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
	transform: scale(1);
	animation: pulse 2s infinite;
}


@keyframes pulse {
	0% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
	}

	70% {
		transform: scale(1.1);
		box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
	}

	100% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
	}
}

.success {
  @apply bg-accent;
}

.warning {
  @apply text-amber-500;
  font-weight: 400;
}

.error {
  @apply text-rose-500;
  font-weight: 400;
}

.item {
  @apply text-xs border-l border-l-transparent border-y border-y-transparent cursor-pointer select-none flex items-center justify-between;

  font-family: 'Poppins';
  font-weight: 200;
  min-width: 200px;

  &:hover {
    border-left-color: $accent;
  }

  &.dragging {
    @apply border border-accent;
  }
}
</style>