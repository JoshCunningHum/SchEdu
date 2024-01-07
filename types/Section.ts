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


// export class SectionLayerArray extends ExtArray<SectionLayer, SectionLayerParams>{
//     constructor(...args: Array<SectionLayer[] | SectionLayer>){
//         super(...args);
//     }
// }

// export interface SectionLayerParams {
//     id: string;
//     settings: TimetableSettings;
// }

// export class SectionLayer extends ExtE<SectionLayer>{
//     id: string;
//     settings: TimetableSettings;
//     lvls: Section[];

//     constructor({ id, settings } : SectionLayerParams){
//         super();
//         this.id = id;
//         this.settings = settings;

//         this.lvls = [];

//         // Add 4 year levels
//         this.addLvl();
//         this.addLvl();
//         this.addLvl();
//         this.addLvl();
//     }

//     removeLvl(lvl: number){
//         const i = this.lvls.findIndex(s => s.year_level === lvl);
//         if(i !== -1) this.lvls.splice(i, 1);
//     }

//     addLvl(){
//         // Finds the gap level and then choose it
//         let attempt = 1;
//         while(this.lvls.some(s => s.year_level === attempt)) attempt++;
        
//         const n = new Section({ section_courses: new CourseArray(), settings: this.settings, id: `${this.id}/---/${attempt}`});
//         n.year_level = attempt;
//         this.lvls.push(n);
//     }

//     equals(obj: SectionLayer): boolean {
//         return obj.id === this.id;
//     }

// }

export class Section extends ExtE<Section>{
    _id: string;

    id: string;
    year_level: number = 1; // not useless now
    // From: List<Integer> - probably stores the ID of the courses
    section_courses : CourseArray;
    scheds: DaySchedArray;

    settings: TimetableSettings;

    constructor({ section_courses, settings, id } : SectionParams){
        super();
        this.id = id;
        this.section_courses = section_courses;
        this.settings = settings;

        this._id = useGenID(16);

        this.scheds = DaySched.create_week(settings);
    }

    equals(sec: Section){
        return sec._id === this._id;
    }

    print(){
        // TODO: Print
    }
}