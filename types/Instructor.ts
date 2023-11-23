import { useGenID } from "~/composables/useGenID";
import type { CourseArray } from "./Course";
import { DaySchedArray, DaySched, Day } from "./DaySched";
import type { TimetableSettings } from "./Timetable";

export class InstructorArray extends Array<Instructor>{
    
    constructor(...scheds: Array<Instructor[] | Instructor>){
        super();
        this.push(...scheds.flat());
    }

    add(params : InstructorParams | Instructor) : Instructor {
        const n = params instanceof Instructor ? params : new Instructor(params);
        this.push(n);
        return n;
    }
    indexOf(sec: Instructor){
        return this.findIndex(s => s.equals(sec));
    }

    remove(sec: Instructor){
        const i = this.indexOf(sec);
        (i !== -1) && this.splice(i, 1);
    }
}

export interface InstructorParams{
    name: string;
    compatible_courses: CourseArray;
    period_start: number;
    period_end: number;
    settings: TimetableSettings;

    // Optional parameters
    max_minutes?: number;
}

export class Instructor{
    id: string;
    name: string;
    max_minutes: number;
    compatible_courses: CourseArray;
    scheds: DaySchedArray;
    total_minutes: number = 0;

    constructor({name, compatible_courses, max_minutes, settings} : InstructorParams){
        this.id = useGenID(8);
        this.name = name;
        this.compatible_courses = compatible_courses;

        this.max_minutes = max_minutes || Number.MAX_SAFE_INTEGER;

        this.scheds = DaySched.create_week(settings);
    }

    addMinutes(minutes: number) : boolean {
        if(this.total_minutes + minutes > this.max_minutes) return false;
        this.total_minutes += minutes;
        return true;
    }

    equals(other: Instructor) : boolean {
        return this.id === other.id;
    }

    print(){
        // TODO: Print
    }
}