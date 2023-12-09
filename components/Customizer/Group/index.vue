<script lang="ts" setup>
import type { PropType } from 'vue';
import { Activity } from '~/types/Activity';
import { Day } from '~/types/DaySched';


const props = defineProps({
  arr: {
    type: Array as PropType<Activity[]>,
    required: true
  },
  categories: {
    type: Array as PropType<string[]>,
    required: true
  }
})

// Stores
const customizerstore = useCustomizerStore();
const {
  courses, rooms, instructors, sections, activities,
  dragged, hovered, mode, selectedAct: selected, previewAct: _act, displayed: current,
  primaryFilter, secondaryFilter
} = storeToRefs(customizerstore);

const arr = computed(() => props.arr);
const categories = computed(() => props.categories);
const category = computed(() => categories.value.length > 0 ? categories.value[0] : '');
const spliced = computed(() => categories.value.slice(1));

const filters = [{
  label: 'Room',
  fn: (a: Activity) : string => {
    return a.room(rooms.value)?.name || '[No Room]'
  }
},{
  label: 'Section',
  fn: (a: Activity) : string => {
    return a.sectionID || '[No Section]'
  }
},{
  label: 'Day',
  fn: (a: Activity) : string => {
    return Day[a.sched] || 'Impossible';
  }
}];

const filter = computed(() => filters.find(f => category.value.includes(f.label))?.fn);
const groups = computed(() => !!filter.value ? {v: useGroupBy(arr.value, filter.value)} : {v: arr.value});

</script>

<template>
  <div v-if="(groups.v instanceof Array) && (Array.isArray(groups.v))" class="group-list flex-col">
    <CustomizerGroupItem v-for="a in groups.v" :key="a.id" :act="a" />
  </div>
  <div class="group-list gap-2" v-else>
    <div class="group-item" v-for="(group, key) in groups.v" :key="key">
      <!-- Recursive Component Sheeeeeeesh -->
      <CustomizerGroup :arr="group" :categories="spliced" />
      <span class="title">{{ key }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/colors.scss";

.title{
  @apply bg-secondary px-2 py-1 rounded-md self-end;
}
.group-item{
  @apply p-1 pl-2 flex border border-secondary rounded-md gap-2;
}
.group-list{
  @apply flex-grow flex flex-col;
}
.item{
  @apply pl-2;
} 

</style>