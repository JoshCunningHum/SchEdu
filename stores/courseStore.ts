import { defineStore } from 'pinia'
import { Course } from '~/types/Course';
import { RoomTypeArray } from '~/types/Room';

export const useCourseStore = defineStore('courseStore', () => {
  const timeTableStore = useTimetableStore();
  const settingsStore = useTimetableSettingsStore();
  const courses = computed(() => timeTableStore.selected?.data?.params.courses);

  const addCourse = (name: string, meetings: number, classes: number, minutes: number) => {
    if(!courses.value) return;

    courses.value.create(Course, {
      name,
      meetings,
      classes_offered: classes,
      minutes,
      room_types: settingsStore.roomTypes ? new RoomTypeArray(...settingsStore.roomTypes) : new RoomTypeArray()
    });

    timeTableStore.change();
  }

  const removeCourse = (id: string | Course) => {
    if(!courses.value) return;
    courses.value.remove(id instanceof Course ? id : (c => c?.id === id));
    timeTableStore.change();
  }

  return {
    courses,
    addCourse,
    removeCourse
  }
})