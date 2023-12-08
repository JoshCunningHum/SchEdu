import { defineStore } from 'pinia'
import { Activity, ActivityArray } from '~/types/Activity';
import { CourseArray, Course } from '~/types/Course';
import { DaySchedArray, type DaySched } from '~/types/DaySched';
import { InstructorArray, Instructor } from '~/types/Instructor';
import { RoomArray, Room } from '~/types/Room';
import { SectionArray, Section } from '~/types/Section';
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
  const activities = computed(() => data.value?.activities || new ActivityArray());

  const mode = ref<{value: number, label: string}>({
    value: 0,
    label: 'Move classes in rooms'
  });

  // Displayed Sched
  const displayed = ref<Room | Section | undefined>();
  const primaryFilter = ref<DaySchedArray | undefined>();
  const secondaryFilter = ref<DaySchedArray | undefined>();
  const previewAct = ref<Activity | undefined>();

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

  const checkClasses = (r: Activity | Course, s: Section) : number => {

    const course = r instanceof Activity ? r.course(courses.value) : r;
    if(!course) return 0;

    const meetings = course.weekly_meetings;

    const sacts = activities.value.filter(a => a.sectionID === s.id);
    const count = sacts.reduce((acc, a) => acc += (a.courseID === course.id) ? 1 : 0, 0);
    
    return meetings - count;
  }


  const getSchedWithAct = (id: string, scheds: DaySchedArray) => {
    return scheds.find(sc => sc.activities.some(a => a.id === id));
  }

  const getActIndexFromSched = (id: string, sched: DaySched) => {
    return sched.activities.findIndex(a => a.id === id);
  }

  const remove = (a: Activity) => {
    if(!a) return;
    

    const instructor = a.instructor(instructors.value);
    const room = a.room(rooms.value);
    const section = a.section(sections.value);

    console.log(`Trying to remove:`, a, instructor);

    if(!!instructor) {
      const sched = getSchedWithAct(a.id, instructor.scheds);
      console.log(sched);
      if(!!sched){
        sched.activities.splice(getActIndexFromSched(a.id, sched), 1);
      }
    }

    if(!!room) {
      const sched = getSchedWithAct(a.id, room.scheds);
      if(!!sched) sched.activities.splice(getActIndexFromSched(a.id, sched), 1);
    }

    if(!!section) {
      const sched = getSchedWithAct(a.id, section.scheds);
      if(!!sched) sched.activities.splice(getActIndexFromSched(a.id, sched), 1);
    }

    // Also remove in the activity array
    activities.value.remove(act => act.id === a.id);
  }

  const add = (a: Activity) => {
    // If found in the activities array, then delete it first
    if(activities.value.has(a)) remove(a);

    const instructor = a.instructor(instructors.value);
    const room = a.room(rooms.value);
    const section = a.section(sections.value);

    if(!!instructor) {
      const sched = instructor.scheds[a.sched - 1];
      if(!!sched) sched.activities.push(a);
    }

    if(!!room) {
      const sched = room.scheds[a.sched - 1];
      if(!!sched) sched.activities.push(a);
    }

    if(!!section) {
      const sched = section.scheds[a.sched - 1];
      if(!!sched) sched.activities.push(a);
    }

    activities.value.add(a);
  }

  const transfer = (a: Activity, v: Course | Room | Instructor | Section) => {
    const course = a.course(courses.value);
    const instructor = a.instructor(instructors.value);
    const room = a.room(rooms.value);
    const section = a.section(sections.value);

    if(v instanceof Course){
      a.courseID = v.id;
      if(!!course) course.course_classes.remove(a);
      v.course_classes.push(a);
      return;
    }
    else if(v instanceof Room && !!room)getSchedWithAct(a.id, room.scheds)?.activities.remove(a);
    else if(v instanceof Instructor && !!instructor)getSchedWithAct(a.id, instructor.scheds)?.activities.remove(a)
    else if(v instanceof Section && !!section)getSchedWithAct(a.id, section.scheds)?.activities.remove(a);

    a.change(v);
    const sched = v.scheds[a.sched - 1];
    sched.activities.push(a);
  }

  // Force Update of things
  const forceUpdateActivityView = ref(false);

  return {
    mode,
    draggedEl,
    dragged,
    hovered,

    courses,
    rooms,
    instructors,
    sections,
    activities,

    remove,
    add,
    transfer,

    selectedAct,
    previewAct,
    displayed,
    primaryFilter,
    secondaryFilter,

    checkSched,
    checkClasses,
    
    forceUpdateActivityView
  }
})
