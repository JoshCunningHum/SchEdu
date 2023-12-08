<script lang="ts" setup>
import { ActivityArray } from '~/types/Activity';
import { Course, CourseArray } from '~/types/Course';
import { Instructor } from '~/types/Instructor';
import { Room, RoomArray } from '~/types/Room';
import { Section, SectionArray } from '~/types/Section';
import { Day } from '~/types/DaySched';

const props = defineProps({
  item: {
    type: [Room, Section, Instructor, Course],
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

const rooms = computed(() => sched.value?.rooms || new RoomArray());
const sections = computed(() => sched.value?.sections || new SectionArray());
const courses = computed(() => sched.value?.courses || new CourseArray());
const activities = computed(() => sched.value?.activities || new ActivityArray());

// Item Details

const item = computed<Room | Instructor | Section | Course>(() => props.item);
const f = computed(() => props.filter?.toLowerCase() || '')
const show = computed(() => !!item.value && (!props.filter ||
  (item.value instanceof Section ? item.value.id.toLowerCase().includes(f.value) : item.value.name.toLowerCase().includes(f.value))));

// Statistics

// Course
const course_offers = (c: Course): number => {
  const { weekly_meetings: meetings } = c;
  const offered = sections.value.reduce((acc, s) => acc += s.section_courses.some(co => co.equals(c)) ? 1 : 0, 0);
  return meetings * offered;
}

const offers_left = (c: Course): number => {
  const offers = course_offers(c);
  // Loop through all room activities and count all activities with course id same as the parameter
  const count = activities.value.filter(a => a.courseID === c.id).length;
  return offers - count;
}

const cov = computed(() => item.value instanceof Course ? course_offers(item.value) : 0);
const olv = computed(() => item.value instanceof Course ? offers_left(item.value) : 0);

const c_sections = computed(() => {
  if (!(item.value instanceof Course)) return [];
  return sections.value.filter(s => s.section_courses.some(c => c.id));
})

// Sections

const section_classes = (s: Section) => {
  return s.section_courses.map(c => {
    return {
      meetings: c.weekly_meetings,
      count: 0, // To be modified in section actual
      course: c.name,
      id: c.id
    }
  })
}

const section_actual_classes = (s: Section) => {
  const section_activities = activities.value.filter(a => a.sectionID === s.id);

  const classes = section_classes(s);
  classes.forEach(stat => {
    stat.count = section_activities.reduce((acc, a) => acc += (a.courseID === stat.id ? 1 : 0), 0);
  })

  return classes;
}

const sac = computed(() => item.value instanceof Section ? section_actual_classes(item.value) : undefined);

// Error and Warnings

const schedConflicts = computed(() => {
  if (!(item.value instanceof Section) && !(item.value instanceof Instructor)) return [];

  const conflicts = item.value.scheds.getConflicts().filter(g => Array.isArray(g));

  return conflicts;
})

const errors = computed(() => {

  if (item.value instanceof Course) {
    return olv.value < 0;
  } else if (item.value instanceof Section) {
    return !!sac.value && sac.value.some(stat => stat.count > stat.meetings) ||
      schedConflicts.value.length > 0;
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

  if (!(item.value instanceof Course) && !(item.value instanceof Section)) return;
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
        <span>{{ item.id }}</span>
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
            <UIcon name="i-mdi-alert" />
          </span>

        </div>


        <template #panel>
          <div class="px-2 py-1 text-xs tracking-wider">

            <div class="warning">
              <div v-if="olv > 0">
                <div>Lacking assignments: {{ cov - olv }} / {{ cov }}</div>
              </div>
              <div v-if="!!sac && sac.some(stat => stat.count < stat.meetings)">
                <div>Lacking course assignments</div>
                <div v-for="stat in sac">
                  <div v-if="stat.count < stat.meetings">
                    - {{ stat.course }}: {{ stat.count }} / {{ stat.meetings }}
                  </div>
                </div>
              </div>
            </div>

            <div class="error">
              <div v-if="olv < 0">
                <div>Exceeding assignments: {{ cov - olv }} / {{ cov }}</div>
              </div>
              <div v-if="!!sac && sac.some(stat => stat.count > stat.meetings)">
                <div>Exceeded course assignments</div>
                <div v-for="stat in sac">
                  <div v-if="stat.count > stat.meetings">
                    - {{ stat.course }}: {{ stat.count }} / {{ stat.meetings }}
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