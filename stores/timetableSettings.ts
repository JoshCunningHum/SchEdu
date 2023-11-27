import { defineStore } from 'pinia'

export const useTimetableSettingsStore = defineStore('TimetableSettings', () => {
  const timetableStore = useTimetableStore();
  const settings = computed(() => timetableStore.selected?.data?.params.settings);

  const roomTypes = computed(() => settings.value?.room_types);

  

  return {
    settings,

    roomTypes
  }
})
