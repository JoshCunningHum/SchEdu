import { defineStore } from 'pinia'
import { Activity } from '~/types/Activity';
import { CourseArray, type Course } from '~/types/Course';
import type { DaySched, DaySchedArray } from '~/types/DaySched';
import { InstructorArray, type Instructor } from '~/types/Instructor';
import { RoomArray, type Room } from '~/types/Room';
import { SectionArray, type Section } from '~/types/Section';
import { TimetableSettings } from '~/types/Timetable';

export type ActProps = "course" | "rooms" | "instructor" | "section";

export const useCustomizerStore = defineStore('customizer', () => {

  const timetableStore = useTimetableStore();
  const data = computed(() => timetableStore.selected?.data?.sched);
  const settings = computed(() => data.value?.settings);
  const _default = new TimetableSettings();
  
  // Parameters
  const rooms = computed(() => data.value?.rooms || new RoomArray());
  const instructors = computed(() => data.value?.instructors || new InstructorArray());
  const sections = computed(() => data.value?.sections || new SectionArray());
  const courses = computed(() => data.value?.courses || new CourseArray());

  const mode = ref<{value: number, label: string}>({
    value: 0,
    label: 'Move classes in rooms'
  });

  // Displayed Sched
  const displayed = ref<Room | Section | undefined>();

  // Drag and Hovered

  const hovered = ref<Course | Section | undefined>();
  const draggedEl = ref<InstanceType<typeof HTMLDivElement>>();
  const dragged = ref<Course| Section | undefined>();

  // Activity Selection/Modification

  const selectedAct = ref<Activity>();

  // Activity Operations

  // Check for transfer if no errors

  // Schedule Conflicts

  const checkSched = (act: Activity, val: Section | Instructor | Room) : boolean => {
    const day = act.sched;
    return !val.scheds[day - 1].isAddable(act);
  }

  // Class Assignments Inconsistency

  const checkClasses = (act: Activity, s: Section) : number => {

    const course = act.course(courses.value);
    if(!course) return 0;

    const meetings = course.weekly_meetings;

    const activities = rooms.value.map(r => r.scheds.map(sc => sc.activities.map(a => a))).flat().flat().filter(a => a.sectionID === s.id);

    const count = activities.reduce((acc, a) => acc += (a.courseID === course.id) ? 1 : 0, 0);
    
    return meetings - count;
  }


  const getSchedWithAct = (id: string, sched: DaySchedArray) => {
    return sched.find(sc => sc.activities.some(a => a.id === id));
  }

  const getActIndexFromSched = (id: string, sched: DaySched) => {
    return sched.activities.findIndex(a => a.id === id);
  }

  const remove = (a: Activity) => {
    if(!a) return;

    const instructor = a.instructor(instructors.value);
    const room = a.room(rooms.value);
    const section = a.section(sections.value);

    if(!!instructor) {
      const sched = getSchedWithAct(a.id, instructor.scheds);
      if(!!sched) sched.activities.splice(getActIndexFromSched(a.id, sched), 1);
    }

    if(!!room) {
      const sched = getSchedWithAct(a.id, room.scheds);
      if(!!sched) sched.activities.splice(getActIndexFromSched(a.id, sched), 1);
    }

    if(!!section) {
      const sched = getSchedWithAct(a.id, section.scheds);
      if(!!sched) sched.activities.splice(getActIndexFromSched(a.id, sched), 1);
    }

  }

  return {
    mode,
    draggedEl,
    dragged,
    hovered,
    selectedAct,
    remove,
    displayed,

    checkSched,
    checkClasses
  }
})
