import { defineStore } from 'pinia'
import type { TimetableSettings } from '~/types/Timetable';

export const useTimetableSettingsStore = defineStore('TimetableSettings', () => {
  const timetableStore = useTimetableStore();
  const settings = computed<TimetableSettings | undefined>(() => timetableStore.selected?.data?.params.settings);

  const roomTypes = computed(() => settings.value?.room_types);

  

  return {
    settings,

    roomTypes
  }
})
