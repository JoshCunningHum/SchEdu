import { useGenID } from '~/composables/useGenID';
import { Course, CourseArray } from './Course';
import { Day, DaySched, DaySchedArray } from './DaySched';
import type { TimetableSettings } from './Timetable';

export class SectionArray extends Array<Section>{
    
    constructor(...scheds: Array<Section[] | Section>){
        super();
        this.push(...scheds.flat());
    }

    add(params : SectionParams | Section) : Section {
        const n = params instanceof Section ? params : new Section(params);
        this.push(n);
        return n;
    }

    indexOf(sec: Section){
        return this.findIndex(s => s.id === sec.id);
    }

    remove(sec: Section){
        const i = this.indexOf(sec);
        (i !== -1) && this.splice(i, 1);
    }
}

export interface SectionParams{
    section_courses: CourseArray;
    settings: TimetableSettings;
}

export class Section{
    id: string;
    // year_level: number; // useless for some reason

    // From: List<Integer> - probably stores the ID of the courses
    section_courses : CourseArray;
    scheds: DaySchedArray;

    settings: TimetableSettings;

    constructor({ section_courses, settings } : SectionParams){
        this.id = useGenID(8);
        this.section_courses = section_courses;
        this.settings = settings;

        this.scheds = DaySched.create_week(settings);
    }

    print(){
        // TODO: Print
    }
}