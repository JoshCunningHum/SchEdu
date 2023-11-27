<script lang="ts" setup>
import { RoomType } from '~/types/Room';


const emit = defineEmits<{
  (e: 'create', roomtype: RoomType) : void
}>();

const timetableStore = useTimetableStore();
const settings = computed(() => timetableStore.selected?.data?.params.settings);
const room_types = computed(() => settings.value?.room_types);

const colors = useColorCollection();

const selected_color = ref<_colorItem>(colors[0]);
const name = ref<string>('');

defineShortcuts({
  enter: {
    usingInput: true,
    handler: () => {
      if(name.value === '') return;
      const n = new RoomType({
        name: name.value, 
        color: '#' + selected_color.value.key
      });
      room_types.value?.add(n);
      name.value = '';
      emit('create', n);
    }
  }
})

</script>

<template>
  <div class="w-full flex gap-2">
    <UFormGroup help="Press enter to add a Room Type." class="flex-grow">
      <UInput v-model="name" placeholder="Enter a Room Name" />
    </UFormGroup>
    <div class="w-[120px]">

      <USelectMenu :options="colors" v-model="selected_color">

        <template #label>
          <span :style="`background: #${selected_color.key};`" class="inline-block h-2 w-2 flex-shrink-0 rounded-full"></span>
          <span>{{ selected_color.name }}</span>
        </template>

        <template #option="{ option: color }">
          <span :style="`background: #${color.key};`" class="inline-block h-2 w-2 flex-shrink-0 rounded-full"></span>
          <span> {{ color.name }} </span>
        </template>

      </USelectMenu>

    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>