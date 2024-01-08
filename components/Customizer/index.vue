<script lang="ts" setup>
import { Course, CourseArray } from '~/types/Course';
import { Instructor, InstructorArray } from '~/types/Instructor';
import { Room, RoomArray } from '~/types/Room';
import { Section, SectionArray } from '~/types/Section';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  }
})

const emit = defineEmits(['update:modelValue']);

const isOpen = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
});


// Stores
const customizerStore = useCustomizerStore();
const timetableStore = useTimetableStore();
const data = computed(() => timetableStore.selected?.data?.sched);

const rooms = computed<Room[]>(() => data.value?.rooms || new RoomArray());
const instructors = computed<Instructor[]>(() => data.value?.instructors || new InstructorArray());
const sections = computed<Section[]>(() => data.value?.sections || new SectionArray());
const courses = computed<Course[]>(() => data.value?.courses || new CourseArray());

// Mode
const modes = ['Move classes in rooms', 'Assign sections to classes', 'Assign instructors to classes', 'Set online classes'].map((v, i) => {
  return {
    value: i,
    label: v
  }
});

const mode = ref(modes[0]);
const modeSearch = ref('');
const current = ref<Room | Course | Section | undefined>();
const selected = computed(() => customizerStore.selectedAct);


whenever(isOpen, () => {
  current.value = undefined;
  customizerStore.selectedAct = undefined;
})


watch(mode, v => {
  
  if(!!v) customizerStore.mode = v;

  if(v.value === 2) current.value = courses.value[0];
  else if(v.value === 3) current.value = sections.value[0];
  else current.value = current.value instanceof Room ? current.value : rooms.value[0];

});
watchImmediate(current, v => (customizerStore.displayed = v));

const prev = () => {
  const collection = mode.value.value === 2 ? courses.value :
                     mode.value.value === 3 ? sections.value : rooms.value;
  const i = collection.findIndex(c => !!current.value && c.id === current.value.id);

  if(i < 1) current.value = collection[0];
  else current.value = collection[i - 1];
}

const next = () => {
  const collection = mode.value.value === 2 ? courses.value :
                     mode.value.value === 3 ? sections.value : rooms.value;
  const i = collection.findIndex(c => !!current.value && c.id === current.value.id);

  if(i >= collection.length - 1) current.value = collection.at(-1);
  else current.value = collection[i + 1];
}

defineShortcuts({
  '1': {
    whenever: [isOpen],
    handler: () => mode.value = modes[0]
  },
  '2': {
    whenever: [isOpen],
    handler: () => mode.value = modes[1]
  },
  '3': {
    whenever: [isOpen],
    handler: () => mode.value = modes[2]
  },
  '4': {
    whenever: [isOpen],
    handler: () => mode.value = modes[3]
  },
  'delete': {
    whenever: [(() => !!selected.value)],
    handler: () => !!selected.value && customizerStore.remove(selected.value)
  },
  'arrowleft': {
    handler: () => prev()
  },
  'arrowright': {
    handler: () => next()
  }
})
</script>

<template>
  <UModal v-model="isOpen" :fullscreen="true">
    <UCard :ui="{
      base: 'h-full flex flex-col min-h-0',
      rounded: '',
      divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      body: {
        base: 'grow min-h-0',
        padding: 'p-0 sm:p-0',
      },
      header: {
        padding: 'px-3 py-2 sm:px-4',
      }
    }">

      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="poppins">Customize</h3>
          <div class="flex gap-2">
            <UBreadcrumb :links="modes" :ui="{ ol: 'gap-x-3' }">

              <template #icon="{ link, index }">
                <UAvatar :alt="(index + 1).toString()"
                  :class="`${mode.value === index ? 'text-accent' : 'text-secondary-em'} cursor-pointer`" :ui="{
                    background: mode.value === index ? 'bg-primary-500 dark:bg-primary-400' : undefined,
                    placeholder: mode.value === index ? 'text-white dark:text-gray-900' : !!link.to ? 'group-hover:text-gray-700 dark:group-hover:text-gray-200' : ''
                  }" size="xs" @click="mode = modes[index]" />
              </template>

              <template #default="{ link, index }">
                <div :class="`${mode.value === index ? 'text-accent' : 'text-secondary-em'} cursor-pointer text-sm`"
                  @click="mode = modes[index]">
                  {{ link.label }} <span class="text-xs text-amber-500" v-if="index === 3">(Optional)</span>
                </div>

              </template>

              <template #divider>
                <span class="w-4 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
              </template>

            </UBreadcrumb>
          </div>
          <UButton color="gray" class="rounded-full" variant="ghost" icon="i-mdi-close" @click="isOpen = false" />
        </div>
      </template>

      <!-- Customizer Here -->
      <div class="flex h-full" v-if="!!isOpen">

        <div class="min-w-[150px] max-w-52 border-r border-secondary h-full min-h-0 flex flex-col">
          <div>
            <!-- Room Selection -->
            <USelectMenu v-model="current" variant="none" 
              :options="mode.value === 2 ? courses : mode.value === 3 ? sections : rooms"
              class="border-b border-secondary"
              :ui="{ rounded: 'rounded-none', input: 'border-transparent dark:border-transparent' }"
              :popper="{ placement: 'right-start' }">

              <template #option="{ option }: { option: Room | Section | Course }">
                <span class="poppins" v-if="(option instanceof Section)">{{ option.id }}</span>
                <span class="poppins" v-else-if="!(option instanceof Section)">{{ option.name }}</span>
              </template>

              <template #label>
                <span v-if="!current" class="flex items-center content-center gap-2">
                  <UIcon name="i-mdi-alert" class="text-red-500" />
                  Select {{ mode.value === 2 ? 'Courses' : mode.value === 3 ? 'Section' : 'Room' }}
                </span>
                <span v-else-if="(current instanceof Section)" class="poppins">{{ current.id }}</span>
                <span v-else-if="!(current instanceof Section)" class="poppins">{{ current.name }}</span>
              </template>

            </USelectMenu>
            <UInput :ui="{ 
              rounded: 'rounded-none', 
              }" 
            variant="none"
            icon="i-mdi-search" placeholder="Search..." v-model="modeSearch" 
            class="border-b border-secondary"
            v-if="mode.value !== 3" />
          </div>

          <!-- Draggable List Here -->
          <div class="scroll-stable" id="list">
            <!-- Idk how to pass multi type values ok -->
            <template v-if="mode.value === 0">
              <template v-for="item in courses" class="item">
                <CustomizerItem :filter="modeSearch" :item="item" />
              </template>
            </template>
            <template v-else-if="mode.value === 1">
              <template v-for="item in sections" class="item">
                <CustomizerItem :filter="modeSearch" :item="item" />
              </template>
            </template>
            <template v-else-if="mode.value === 2">
              <template v-for="item in instructors" class="item">
                <CustomizerItem :filter="modeSearch" :item="item" />
              </template>
            </template>
          </div>
        </div>

        <!-- Main Section -->
        <template v-if="(current instanceof Room) || (current instanceof Section)" >
          <CustomizerSched :sched="current.scheds" />
        </template>
        <template v-else-if="(current instanceof Course)">
          <CustomizerActivityGrouper class="flex-grow " />
        </template>
        <template v-else>
          <div class="flex-grow"></div>
        </template>

        <!-- Activity Viewer -->
        <div class="min-w-[250px] max-w-[250px] border-l border-secondary h-full">
          <CustomizerActivity />
        </div>
      </div>

    </UCard>
  </UModal>
</template>

<style lang="scss" scoped>
@import "@/assets/colors.scss";

#list {
  @apply h-full overflow-y-auto min-h-0 flex flex-col pl-2 py-2;
}


</style>