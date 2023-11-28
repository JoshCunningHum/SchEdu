import { CourseArray } from './Course';
import { DaySched, DaySchedArray } from './DaySched';
import type { TimetableSettings } from './Timetable';
import { ExtArray, ExtE } from './ExtendedArray';

export class SectionArray extends ExtArray<Section, SectionParams>{
    constructor(...scheds: Array<Section[] | Section>){
        super(...scheds);
    }
}

export interface SectionParams{
    id: string;
    section_courses: CourseArray;
    settings: TimetableSettings;
}

export class Section extends ExtE<Section>{
    id: string;
    // year_level: number; // useless for some reason

    // From: List<Integer> - probably stores the ID of the courses
    section_courses : CourseArray;
    scheds: DaySchedArray;

    settings: TimetableSettings;

    constructor({ section_courses, settings, id } : SectionParams){
        super();
        this.id = id;
        this.section_courses = section_courses;
        this.settings = settings;

        this.scheds = DaySched.create_week(settings);
    }

    equals(sec: Section){
        return sec.id === this.id;
    }

    print(){
        // TODO: Print
    }
}