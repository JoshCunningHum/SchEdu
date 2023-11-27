import { defineStore } from 'pinia'
import { CourseArray } from '~/types/Course';
import { Section } from '~/types/Section';
import { TimetableSettings } from '~/types/Timetable';

export const useSectionStore = defineStore('sectionStore', () => {
  const timetableStore = useTimetableStore();
  const settings = computed(() => timetableStore.selected?.data?.params.settings);
  const sections = computed(() => timetableStore.selected?.data?.params.sections);

  const addSection = (id: string) => {
    if(!sections.value) return;
    sections.value.create(Section, {
      id,
      section_courses: new CourseArray(),
      settings: settings.value || new TimetableSettings()
    });
  }

  const removeSection = (id: string) => {
    if(!sections.value) return;
    sections.value.remove(s => s.id === id);
  }

  return {
    sections,
    addSection,
    removeSection
  }
})