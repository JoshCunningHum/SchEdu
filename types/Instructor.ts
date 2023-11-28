import { useGenID } from "~/composables/useGenID";
import type { CourseArray } from "./Course";
import { DaySchedArray, DaySched, Day } from "./DaySched";
import type { TimetableSettings } from "./Timetable";
import { ExtArray, ExtE } from "./ExtendedArray";

export class InstructorArray extends ExtArray<Instructor, InstructorParams>{
    
    constructor(...scheds: Array<Instructor[] | Instructor>){
        super(...scheds);
    }

}

export interface InstructorParams{
    name: string;
    compatible_courses: CourseArray;
    period_start?: number;
    period_end?: number;
    settings: TimetableSettings;

    // Optional parameters
    max_minutes?: number;
}

export class Instructor extends ExtE<Instructor>{
    id: string;
    name: string;
    max_minutes: number;
    compatible_courses: CourseArray;
    scheds: DaySchedArray;
    total_minutes: number = 0;

    constructor({name, compatible_courses, max_minutes, settings, period_start, period_end } : InstructorParams){
        super();
        this.id = useGenID(8);
        this.name = name;
        this.compatible_courses = compatible_courses;

        this.max_minutes = max_minutes || Number.MAX_SAFE_INTEGER;

        this.scheds = DaySched.create_week(settings, period_start, period_end);
    }

    addMinutes(minutes: number) : boolean {
        if(this.total_minutes + minutes > this.max_minutes) return false;
        this.total_minutes += minutes;
        return true;
    }

    equals(other: Instructor) : boolean {
        return this.id === other.id;
    }

    // UI Helper Functions

    print(){
        // TODO: Print
    }
}