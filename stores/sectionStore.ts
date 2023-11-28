import { defineStore } from 'pinia'
import { CourseArray } from '~/types/Course';
import { Section } from '~/types/Section';
import { TimetableSettings } from '~/types/Timetable';

export const useSectionStore = defineStore('sectionStore', () => {
  const timetableStore = useTimetableStore();
  const courseStore = useCourseStore();
  const settings = computed(() => timetableStore.selected?.data?.params.settings);
  const sections = computed(() => timetableStore.selected?.data?.params.sections);

  const courses = computed(() => courseStore.courses);

  const addSection = (id: string) => {
    if(!sections.value) return;
    sections.value.create(Section, {
      id,
      section_courses: !!courses.value ? new CourseArray(...courses.value) : new CourseArray(),
      settings: settings.value || new TimetableSettings()
    });
    timetableStore.change();
  }

  const removeSection = (id: string) => {
    if(!sections.value) return;
    sections.value.remove(s => s.id === id);
    timetableStore.change();
  }

  return {
    sections,
    addSection,
    removeSection
  }
})