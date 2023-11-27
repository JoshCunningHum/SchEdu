<script lang="ts" setup>
import { RoomType, RoomTypeArray } from '~/types/Room';

const roomStore = useRoomStore();
const rooms = computed(() => roomStore.rooms);

const props = defineProps({
  list: {
    type: RoomTypeArray,
  }
})

const remove = (roomType: RoomType) => {
  if (!props.list || props.list.length === 1) return;
  props.list.remove(roomType);
}

</script>

<template>
  <div class="flex-grow flex flex-wrap gap-2 content-start overflow-y-auto min-h-0" id="room-list">

    <UPopover mode="hover" :popper="{placement: 'right-start'}" v-for="t in list" :key="t.id">
      
      <div class="item" :style="`background: ${t.color}; border-color: ${t.color}`">
        <div><span class="text-sm jetbrainsmono">{{ `[${rooms?.filter(rm => rm.type.equals(t)).length}]` || '' }}</span> {{ t.name }}</div>
        <UIcon @click="remove(t)" class="cursor-pointer" name="i-mdi-close"></UIcon>
      </div>

      <template #panel>
        <div v-if="rooms && rooms.has((r => !!r && r.type.equals(t)))" class="px-2 py-1 flex flex-col gap-1 border border-secondary-em rounded-md">
          <div v-for="r in rooms.filter(rm => rm.type.equals(t))" class="text-xs text-secondary-em">
            - {{ r.name }}
          </div>
        </div>
      </template>

    </UPopover>

  </div>
</template>

<style lang="scss" scoped>

.item {
  @apply border flex items-center justify-center px-2 rounded-md gap-2 select-none;
  height: 32px;
}
</style>