<script lang="ts" setup>
import { get, set } from '@vueuse/core';
import { Activity } from '~/types/Activity';
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
  courses, rooms, instructors, sections, activities, settings,
  dragged, hovered, mode, selectedAct: selected, previewAct: _act, selectedPairs: pair,
  primaryFilter, secondaryFilter
} = storeToRefs(customizerstore);

// Associated Data
const day = computed(() => act.value.sched);
const start = computed(() => act.value.start_time);
const end = computed(() => act.value.end);
const course = computed(() => act.value.course(courses.value));
const room = computed(() => act.value.room(rooms.value));
const instructor = computed(() => act.value.instructor(instructors.value));
const section = computed(() => act.value.section(sections.value));

const pstart = computed(() => get(settings)?.start || 0);
const pend = computed(() => get(settings)?.end || 0);

const startformat = computed(() => useMinutesToTime(get(start)));
const endformat = computed(() => useMinutesToTime(get(end)));

// Operation
const setTeacher = (t: Instructor) => {
  if (!selected.value) return;

  // TODO: Do validation
  customizerstore.transfer(selected.value, t);
  pair.value.forEach(a => customizerstore.transfer(a, t));
}

// Some styling
const isover = ref(false);
const isselected = computed(() => get(selected)?.id === get(act).id);
const isapair = computed(() => !!get(pair).find(a => a.id === act.value.id));

whenever(() => !get(dragged), () => {
  set(isover, false);
})

const ondragover = (e: DragEvent) => {
  if (!(get(dragged) instanceof Instructor)) return;
  e.preventDefault();

  set(isover, true);
  // Might be changed later
  set(selected, get(act));
}

const ondragleave = (e: DragEvent) => {
  set(isover, false);
}

const ondrop = (e: DragEvent) => {
  if (!(get(dragged) instanceof Instructor)) return;
  e.preventDefault();

  if (!selected.value || !dragged.value || !(dragged.value instanceof Instructor)) return;

  setTeacher(dragged.value);
}

const select = () => {
  customizerstore.selectedAct = get(act);
}

// Validation Notifs
const compat_teacher = computed(() => !course.value || !instructor.value || instructor.value.compatible_courses.has(course.value));

const conflict_inst = computed(() => instructor.value?.scheds[day.value - 1].getConflicts(act.value) || []);

// Warnings
const warnings = computed(() => {

// Instructor Possible
if(!compat_teacher.value) return true;
if(!instructor.value) return true;

return false;
})

// Errors

const errors = computed(() => {
// Instructor Possible
if(conflict_inst.value.length > 0) return true;

return false;
})


// Time Period Visualization
const el = ref<InstanceType<typeof HTMLDivElement>>();
const pduration = computed(() => get(pend) - get(pstart));
const cstart = computed(() => get(start) - get(pstart));
const cend = computed(() => get(end) - get(pstart));
const { width } = useElementBounding(el);

const projected = computed(() => {
  return {
    left: useProjection(cstart, [0, get(pduration)], [0, get(width)]),
    right: useProjection(cend, [0, get(pduration)], [0, get(width)])
  }
})

const _left = computed(() => get(projected).left.value);
const _width = computed(() => get(projected).right.value - get(projected).left.value);

</script>

<template>
  <div :class="`item flex gap-1 relative ${isover ? 'over' : ''
    } ${isselected ? 'selected' : ''
    } ${isapair ? 'pair' : ''
    }`" @dragover="ondragover" @dragleave="ondragleave" @drop="ondrop" @click="select" ref="el">
    <div class="w-5 text-accent flex items-center justify-center">
      <UIcon name="i-mdi-circle" class="paircle" v-if="isapair || isselected" />
    </div>

    <div class="flex-grow">

      <span class="text-center">
        {{ course?.name }}
        -
        <span class=" whitespace-nowrap">{{ section?.id || '[No Section]' }}</span>
      </span>
      <span>
        - {{ instructor?.name || `[No Instructor]` }} - [{{ Day[day] }}] {{ startformat.str }} - {{ endformat.str }}
      </span>

      <!-- Time Period Visualization -->
      <span class="absolute h-px w-full bg-secondary bottom-0 left-0"></span>
      <span class="absolute h-px bottom-0 bg-accent" :style="`left: ${_left}px; width: ${_width}px;`">
      </span>

    </div>

    <UPopover mode="hover"> 

      <div>
        <UIcon name="i-mdi-alert"
          :class="`pulsating ${errors ? 'error' : warnings ? 'warning' : ''}`"
          v-if="errors || warnings"/>
      </div>

      <template #panel>
        <div class="bg-primary px-2 py-1" style="z-index: 100;">

          <div class="warning">
            <div v-if="!compat_teacher">
              {{ instructor?.name }} does not do {{ course?.name }}
            </div>
            <div v-if="!instructor">
              No Instructor Assigned
            </div>
          </div>

          <div class="error">
            <!-- Schedule Conflicts-->

            <div v-if="conflict_inst.length > 0">
              <div>{{ instructor?.name }} Schedule Conflict:</div>
              <div v-for="(group, groupI) in conflict_inst" :key="groupI">
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
</template>

<style lang="scss" scoped>
@import "@/assets/colors.scss";

.comafy+.comafy::before {
  content: ', ';
}

.dashify+.dashify::before {
  content: ' - ';
}

.item {
  @apply border rounded-md border-transparent p-2 cursor-pointer overflow-hidden;

  font-family: 'Poppins';

  &:hover {
    @apply bg-secondary;
  }

  &.pair {
    @apply text-accent;
  }

  &.selected {
    @apply bg-accent-em text-accent;
    color: $accent !important;

    &.over {
      color: $primary !important;
    }
  }

  &.over {
    @apply border-accent bg-accent;
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

.warning {
  @apply text-amber-500;
  font-weight: 400;
}

.error {
  @apply text-rose-500;
  font-weight: 400;
}
</style>