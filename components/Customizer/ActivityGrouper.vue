<script lang="ts" setup>
import type { Activity } from '~/types/Activity';


const customizerstore = useCustomizerStore();
const {
  courses, rooms, instructors, sections, activities,
  dragged, hovered, mode, selectedAct: selected, previewAct: _act, displayed: current,
  primaryFilter, secondaryFilter
} = storeToRefs(customizerstore);

// Grouper Categories

/**Multiple */
const category = [
  'Room',
  'Section',
  'Day',
];

const groupbyvalues = ref([]);

// Filtered Activity according to course
const filtered = computed(() => activities.value.filter(a => a.courseID === current.value?.id))

// Selecting
const select = (a: Activity) => {
  customizerstore.selectedAct = a;
}

</script>

<template>
  <div class="flex-grow flex flex-col">
    <div class="px-2 py-1 poppins border-b border-secondary w-full flex gap-2 items-center text-sm">
      <span>Group By:</span>
      <span>
        <USelectMenu :options="category" :multiple="true" v-model="groupbyvalues" variant="none" :ui="{width: 'min-w-52'}">
          <template #label>
            <span v-if="groupbyvalues.length" class="flex min-w-[50px]">
              <span v-for="(group, i) in groupbyvalues" class="flex items-center">
                <span>{{ group }}</span> <span v-if="i !== groupbyvalues.length - 1" class="flex items-center px-1"><UIcon name="i-mdi-chevron-right" /></span>
              </span>
            </span>
            <span v-else class="flex min-w-[50px]">Nothing</span>
          </template>
        </USelectMenu>
      </span>

    </div>

    <div class="flex-grow flex gap-1.5 relative min-h-0 overflow-y-auto scroll-stable">

      <div class="flex-grow scroll-stable min-h-0 overflow-y-auto p-2 text-sm">

        <CustomizerGroup :arr="filtered" :categories="groupbyvalues" />

      </div>
      <div class="min-w-[250px] border-l border-secondary h-full ">

        <EmptyDisplay class="text-sm" v-if="!selected">
          No Activity Selected
        </EmptyDisplay>
        <CustomizerTeacherList v-else />

      </div>

    </div>

  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/colors.scss";

.item {
  @apply px-2 py-1 pl-7 border border-transparent cursor-pointer;
  font-family: 'Poppins';
  font-weight: 200;

  &:hover{
    @apply bg-secondary;
  }

  &.selected {
    @apply bg-accent-em text-accent;
  }
}

</style>