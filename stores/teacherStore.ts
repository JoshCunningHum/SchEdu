import { defineStore } from 'pinia'
import type { Course } from './courseStore';

export class TimeSched{
  from: number;
  to: number;
  constructor(from: number, to: number){

    if(from > to) throw new Error("End time shouldn't be before Start time");

    this.from = from;
    this.to = to;
  }

  get duration(): number {
    return this.to - this.from;
  }
}

export class DaySched{
  shifts: TimeSched[];

  constructor(shifts?: TimeSched[]){
    this.shifts = shifts || new Array<TimeSched>;
  }

  isWithinSched(time : number) : boolean {
    if(this.shifts === undefined) return false;

    // Loop through the shifts
    return this.shifts?.some(shift => shift.from <= time && shift.to >= time);
  }

  addSched(from: number, to: number) : boolean {
    // Check if both numbers do not conflict with existing scheds
    if(this.isWithinSched(from) || this.isWithinSched(to)) return false;
    this.shifts.push(new TimeSched(from, to));
    return true;
  }
}

export class WeekSched{
  map: Map<string, DaySched>;

  constructor(){
    this.map = new Map<string, DaySched>();
  }

  addSched(from: number, to: number, day: string): boolean {
    // Get daysched
    const sched : DaySched = this.get(day) || new DaySched();
    const isAdded : boolean = sched.addSched(from, to);
    if(this.get(day) === undefined) this.map.set(day, sched);
    return isAdded
  }

  get(day: string) : DaySched | undefined {
    return this.map.get(day);
  }
}

export interface ITeacher{
  name: string;
  courses: Course[];
  availability: WeekSched;
}

export class Teacher {
  name: string;
  courses: Course[];
  sched: WeekSched;

  constructor(name: string){
    this.name = name;
    this.courses = new Array<Course>;
    this.sched = new WeekSched();
  }
}

export const useTeacherStore = defineStore('teacherStore', () => {
  const timeTableStore = useTimetableStore();
  const timeTable = computed(() => timeTableStore.selected);
  const data = computed(() => timeTable.value?.data)

  const teachers = computed(() => data.value?.params.teachers);

  const addTeacher = (name: string) => {
    // Create instance
    const teacher = new Teacher(name);
    // Update data object
    timeTableStore.hasChanges = true;
    data.value?.params.teachers.push(teacher);
  }

  const removeTeacher = (name: string) => {

  }

  return {
    teachers,
    addTeacher,
    removeTeacher
  }
})
