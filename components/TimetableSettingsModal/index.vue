<script lang="ts" setup>
import { 
  TimetableSettingsModalPriorities, 
  TimetableSettingsModalTiming ,
  TimetableSettingsModalConstraints,
  TimetableSettingsModalRoomTypes
} from '#components';

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

// Settings
const tabs = [{
  key: 'Timing',
  label: 'Timing',
  component: TimetableSettingsModalTiming
},{
  key: 'Priorities',
  label: 'Priorities',
  component: TimetableSettingsModalPriorities
},{
  key: 'RoomTypes',
  label: 'Room Types',
  component: TimetableSettingsModalRoomTypes
},{
  key: 'Constraints',
  label: 'Constraints',
  component: TimetableSettingsModalConstraints
}];


</script>

<template>
    <UModal v-model="isOpen" :ui="{width: 'w-[700px] sm:max-w-4xl', height: 'h-[500px]'}">
      <div class="p-2 bg-primary min-w-[700px] h-full">
        <UTabs :items="tabs" class="w-full h-full" orientation="vertical"
          :ui="{
              wrapper: 'flex gap-3', 
              list: {
                width: 'w-48', 
                base: 'text-left', 
                height: 'h-full',
                background: 'dark:bg-neutral-800'
              }, 
              base: 'h-full'}">
          <template #item="{ item }">
            <!-- <component v-bind:is="importTab(item.key)" /> -->
            <div style="min-height: 400px;" class="flex flex-col h-full">
              <component :is="item.component" class="h-full w-full"/>
            </div>
          </template>
        </UTabs>
      </div>
    </UModal>
</template>

<style lang="scss" scoped>

</style>