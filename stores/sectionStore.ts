import { defineStore } from 'pinia'
import { CourseArray } from '~/types/Course';
import { Section } from '~/types/Section';
import { TimetableSettings } from '~/types/Timetable';
import { get, set } from '@vueuse/core';

const SECTION_LVL_SPLITTER = '/---/';

export const useSectionStore = defineStore('sectionStore', () => {
  const timetableStore = useTimetableStore();
  const courseStore = useCourseStore();

  const settings = computed(() => timetableStore.selected?.data?.params.settings);
  const sections = computed(() => timetableStore.selected?.data?.params.sections);

  const sectiongroups = computed(() => {
    const arr = Array<string>();
    
    get(sections)?.forEach(s => {
      if(arr.some(g => g === s.id)) return;
      arr.push(s.id);
    })

    return arr;
  })

  const courses = computed(() => courseStore.courses);

  const addSection = (id: string) => {
    // Create 4 sections with said id
    Array(4).fill(0).forEach((v, i) => {
      if(!sections.value) return;

      const s = new Section({ 
        section_courses: new CourseArray(),
        settings: get(settings) || new TimetableSettings(),
        id
      });
      s.year_level = i + 1;
      
      sections.value.push(s);
    })

    timetableStore.change();
  }

  const addYearLevel = (id: string) => {
    if(!sections.value) return;

    // Get the section group for this id
    const group = sections.value.filter(s => s.id === id);

    // Get the year level gap
    let attempt = 1;
    while(group.some(s => s.year_level === attempt)) attempt++;

    if(attempt > 6) return;

    const s = new Section({
      section_courses: new CourseArray(),
      settings: get(settings) || new TimetableSettings(),
      id
    });
    s.year_level = attempt;
    sections.value.push(s);
  }

  const renameSection = (id: string, str: string) => {
    if(!sections.value) return;

    // Make sure that string is not already in the section group
    if(sectiongroups.value.some(s => s === str)) return;

    sections.value
      .filter(s => s.id === id)
      .forEach(s => s.id = str);
  }

  const removeSection = (id: string) => {
    if(!sections.value) return;
    sections.value
      .filter(s => s.id === id)
      .forEach(s => sections.value?.remove(ss => ss._id === s._id));
    timetableStore.change();
  }

  const removeYearLevel = (_id: string) => {
    if(!sections.value) return;
    sections.value.remove(s => s._id === _id);
  } 

  return {
    sections,
    sectiongroups,

    addSection,
    removeSection,
    renameSection,
    addYearLevel,
    removeYearLevel
  }
})