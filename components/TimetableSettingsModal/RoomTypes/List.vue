<script lang="ts" setup>
import { RoomType, RoomTypeArray } from '~/types/Room';
import draggable from 'vuedraggable';

const roomStore = useRoomStore();
const rooms = computed(() => roomStore.rooms);

const props = defineProps({
  list: {
    type: RoomTypeArray,
    required: true
  }
})

const types = computed({
  get: () => [...props.list.map(r => r)],
  set: v => {
    props.list.splice(0);
    props.list.push(...v);
  }
});

const drag = ref(false);

const remove = (roomType: RoomType) => {
  if (!props.list || props.list.length === 1) return;
  props.list.remove(roomType);
}

</script>

<template>
  <div class="flex-grow flex flex-wrap gap-2 content-start overflow-y-auto min-h-0" id="room-list">

    <!-- Wrap in draggable -->
    <draggable 
      class="flex flex-grow flex-wrap gap-2 content-start overflow-auto min-h-0"
      v-model="types"
      group="room-types"
      @start="drag = true"
      @end="drag = false"
      item-key="id">

      <template #item="{ element: t }">

        <div class="item" :style="`background: ${t.color}; border-color: ${t.color}`">
          <UIcon name="i-mdi-menu" class="handle cursor-pointer" />
          <UPopover mode="hover" :popper="{ placement: 'right' }">

            <div class="flex flex-grow gap-2 items-center cursor-default">

              <div>{{ t.name }}</div>
              <UIcon @click="remove(t)" name="i-mdi-close"></UIcon>

            </div>

            <template #panel>
              <div v-if="rooms && rooms.has((r => !!r && r.type.equals(t)))"
                class="px-2 py-1 flex flex-col gap-1 border border-secondary-em rounded-md">
                <div v-for="r in rooms.filter(rm => rm.type.equals(t))" class="text-xs text-secondary-em">
                  - {{ r.name }}
                </div>
              </div>
            </template>

          </UPopover>
        </div>



      </template>

    </draggable>

  </div>
</template>

<style lang="scss" scoped>
.item {
  @apply border flex items-center justify-start px-2 rounded-md gap-2 select-none;
  height: 32px;
}
</style>