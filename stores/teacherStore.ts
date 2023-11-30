import { defineStore } from 'pinia'
import { Instructor, InstructorArray } from '~/types/Instructor';
import { useCourseStore } from './courseStore';
import { CourseArray } from '~/types/Course';
import { TimetableSettings, type TimetableParams, type TimeTableModel } from '~/types/Timetable';


export const useTeacherStore = defineStore('teacherStore', () => {

  const timeTableStore = useTimetableStore();
  const courseStore = useCourseStore();

  const timeTable = computed<TimeTableModel | null>(() => timeTableStore.selected);
  const params = computed<TimetableParams | null | undefined>(() => timeTable.value?.data?.params)

  const teachers = computed<InstructorArray | null | undefined>(() => params.value?.instructors);

  const addTeacher = (name: string) => {
    // Create instance
    const teacher = new Instructor({
      name, 
      compatible_courses: !!courseStore.courses ? new CourseArray(...courseStore.courses) : new CourseArray(),
      period_start: params.value?.settings?.start || 0,
      period_end: params.value?.settings?.end || 0,
      settings: params.value?.settings || new TimetableSettings()
    });
    // Update data object
    timeTableStore.hasChanges = true;
    params.value?.instructors.push(teacher);
    timeTableStore.change();
  }

  const removeTeacher = (id: string) => {
    const target = teachers.value?.find(t => t.id === id);
    if(target) teachers.value?.remove(target);
    timeTableStore.change();
  }

  return {
    teachers,
    addTeacher,
    removeTeacher
  }
})