<script lang="ts" setup>
import { Activity } from '~/types/Activity';
import { Course } from '~/types/Course';
import { Section } from '~/types/Section';
import { Day } from '~/types/DaySched';
import { Instructor } from '~/types/Instructor';

const props = defineProps({
  act: {
    type: Activity,
    required: true
  }
})

const act = computed(() => props.act);

// Stores
const customizerstore = useCustomizerStore();
const {
  courses, rooms, instructors, sections, activities,
  dragged, hovered, mode, selectedAct: selected, previewAct: _act,
  primaryFilter, secondaryFilter
} = storeToRefs(customizerstore);

// Associated Data
const day = computed(() => act.value.sched);
const course = computed(() => act.value.course(courses.value));
const room = computed(() => act.value.room(rooms.value));
const instructor = computed(() => act.value.instructor(instructors.value));
const section = computed(() => act.value.section(sections.value));

//#region Dragging the session

const ondragstart = (e: DragEvent, a: Activity) => {
  // customizerStore.remove(a);
  _act.value = a.clone();

  // Disable Drag Image
  const c = document.createElement('canvas');
  c.width = c.height = 50;
  e.dataTransfer?.setDragImage(c, 25, 25);

  // Create this section's primary filter
  const s = a.section(sections.value);
  if (!!s) primaryFilter.value = s.scheds;

  // Create this instructor's secondary filter
  const i = a.instructor(instructors.value);
  if (!!i) secondaryFilter.value = i.scheds;
}

const ondragend = (e: DragEvent, a: Activity) => {
  _act.value = undefined;
  primaryFilter.value = undefined;
  secondaryFilter.value = undefined;
}

//#endregion

//#region Dragging on the sesion

const ondragover = (e: DragEvent, a: Activity) => {
  if (!dragged.value || !(dragged.value instanceof Section)) return;
  e.preventDefault();
}

const ondragleave = (e: DragEvent, a: Activity) => {

}

const ondragenter = (e: DragEvent, a: Activity) => {

}

const ondrop = (e: DragEvent, a: Activity) => {
  if (!dragged.value || !(dragged.value instanceof Section)) return;
  e.preventDefault();

  const day = a.sched;
  // Remove this activity to the section sched array
  a.section(sections.value)?.scheds[day - 1].activities.remove(ac => ac.id === a.id);

  a.sectionID = dragged.value.id;
  a.section(sections.value)?.scheds[day - 1].activities.push(a);
}
//#endregion

// Selecting Activities
const select = (a: Activity) => {
  customizerstore.selectedAct = a;
}

// Validation Notifs

const compat_teacher = computed(() => !course.value || !instructor.value || instructor.value.compatible_courses.has(course.value));
const compat_section = computed(() => !course.value || !section.value || section.value.section_courses.has(course.value));
const compat_room = computed(() => !course.value || !room.value || course.value.compatible_rooms.has(room.value.type));

const conflict_room = computed(() => room.value?.scheds[day.value - 1].getConflicts(act.value) || []);
const conflict_inst = computed(() => instructor.value?.scheds[day.value - 1].getConflicts(act.value) || []);
const conflict_sect = computed(() => section.value?.scheds[day.value - 1].getConflicts(act.value) || []);

const course_class_req = computed(() => course.value?.weekly_meetings || 0);
const course_class_count = computed(() => !!section.value ? customizerstore.checkClasses(act.value, section.value) : 0);

// Warnings

const warnings = computed(() => {

  // Course Possible 

  // Room Possible
  if(!compat_room.value) return true;

  // Instructor Possible
  if(!compat_teacher.value) return true;

  // Section Possible
  if(course_class_count.value > 0) return true;

  return false;
})

// Errors

const errors = computed(() => {

  // Course Possible

  // Room Possible
  if(conflict_room.value.length > 0) return true;

  // Instructor Possible
  if(conflict_inst.value.length > 0) return true;

  // Section Possible
  if(conflict_sect.value.length > 0 || course_class_count.value < 0 || !compat_section.value) return true;

  return false;
})

</script>

<template>
  <div :class="`activity relative ${selected?.id === act.id ? 'selected' : ''
    } ${hovered instanceof Course ? (hovered.id === act.courseID ? 'hovered' : '') :
      hovered instanceof Section ? (hovered.id === act.sectionID ? 'hovered' : '') : ''
    } ${mode.value === 1 && !act.sectionID ? 'lacking' : ''
    } ${dragged instanceof Section ? 'z-30' : ''
    } ${!!_act ? (_act.id === act.id ? '' : 'pointer-events-none') : ''
    }`" :draggable="true" @dragstart="ondragstart($event, act)" @dragend="ondragend($event, act)"
    @dragover="ondragover($event, act)" @drop="ondrop($event, act)" @dragleave="ondragleave($event, act)"
    @dragenter="ondragenter($event, act)" @click="select(act)">
    <span class="text-center">
      {{ course?.name }}
      -
      <span class=" whitespace-nowrap">{{ section?.id || '[No Section]' }}</span>
    </span>
    <span>
      {{ instructor?.name || `[No Instructor]` }}
    </span>
    <span>
      {{ room?.name || `[No Room]` }}
    </span>

    <!-- Alerter -->
    <UPopover mode="hover"
      class="absolute right-1.5 top-1.5" v-if="!!course">

      <div>
        <UIcon name="i-mdi-alert" class="text-lg error pulsating" v-if="errors || warnings"/>
      </div>

      <template #panel>
        <div class="bg-primary px-2 py-1" style="z-index: 100;">

          <div class="warning">
            <div v-if="!compat_room">
              {{ course.name }} in a {{ room?.type.name }} Room
            </div>
            <div v-if="!compat_teacher">
              {{ instructor?.name }} does not do {{ course.name }}
            </div>
            <div v-if="!compat_section">
              {{ section?.id }} does not offer {{ course.name }}
            </div>
            <div v-if="course_class_count > 0">
              {{ course.name }}-{{ section?.id }}: {{ course_class_count }} / {{ course_class_req }}
            </div>
          </div>

          <div class="error">
            <!-- Schedule Conflicts-->
            <div v-if="conflict_room.length > 0">
              <div>{{ room?.name }} Schedule Conflict:</div>
              <div v-for="(group, groupI) in conflict_room" :key="groupI">
                  - ({{ Day[group[0].sched] }})
                  <span v-for="act in group" :key="act.id" class="dashify">
                    <!-- TODO: Add more information? -->
                    {{ act.course(courses)?.name }}
                  </span>
                </div>
            </div>

            <div v-if="conflict_inst.length > 0">
              <div>{{ instructor?.name }} Schedule Conflict:</div>
              <div v-for="(group, groupI) in conflict_inst" :key="groupI">
                  - ({{ Day[group[0].sched] }})
                  <span v-for="act in group" :key="act.id" class="dashify">
                    {{ act.course(courses)?.name }} [{{ act.room(rooms)?.name }}]
                  </span>
                </div>
            </div>

            <div v-if="conflict_sect.length > 0">
              <div>{{ section?.id }} Schedule Conflict:</div>
              <div v-for="(group, groupI) in conflict_sect" :key="groupI">
                  - ({{ Day[group[0].sched] }})
                  <span v-for="act in group" :key="act.id" class="dashify">
                    {{ act.course(courses)?.name }} [{{ act.room(rooms)?.name }}]
                  </span>
                </div>
            </div>

            <!-- Exceeded Meetings -->
            <div v-if="course_class_count < 0">
              {{ course.name }}-{{ section?.id }}: {{ course_class_req - course_class_count }} / {{ course_class_req }}
            </div>

            <!-- Section does not offer such course -->
            <div v-if="!compat_section">
              {{ section?.id }} does not offer {{ course.name }}
            </div>

          </div>

        </div>
      </template>

    </UPopover>

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

.warning {
  @apply text-amber-500;
  font-weight: 400;
}

.error {
  @apply text-rose-500;
  font-weight: 400;
}

.drops {
  &.over {
    // @apply border border-dashed;
  }
}

.pulsating{
	box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
	transform: scale(1);
	animation: pulse 2s infinite ease-in-out;
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

.activity {
  @apply absolute flex bg-primary items-center justify-center border border-accent text-xs flex-col mx-auto cursor-pointer left-0 right-0;


  &.not-allowed {
    @apply bg-rose-600 border-primary;
  }

  &.hovered {
    @apply bg-secondary;

    &.selected {
      @apply bg-green-300;
    }
  }

  &.selected {
    @apply bg-accent;
  }

  &.lacking {
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
</style>