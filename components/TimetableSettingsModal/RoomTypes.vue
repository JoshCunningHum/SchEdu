<script lang="ts" setup>
import { RoomTypeArray, type RoomType } from '~/types/Room';

const timetableStore = useTimetableStore();
const settings = computed(() => timetableStore.selected?.data?.params.settings);

// Room Deletion
const room_types = computed<RoomTypeArray>(() => settings.value?.room_types || new RoomTypeArray());

const remove = (roomType: RoomType) => {
  if(room_types.value === undefined || room_types.value.length === 1) return;
  room_types.value.remove(roomType);
}

</script>

<template>
  <div class="flex flex-grow flex-col h-full">

    <SectionAlert>
      Removing a type requires you to check the rooms that has that type that was removed.
    </SectionAlert>

    <TimetableSettingsModalRoomTypesCreator />

    <!-- Roomtype list -->
    <SectionAlert class="mt-1" v-if="room_types?.length === 1">
      Atleast 1 Room Type should remain
    </SectionAlert>
    <TimetableSettingsModalRoomTypesList :list="room_types" />

  </div>
</template>

<style lang="scss" scoped>
</style>