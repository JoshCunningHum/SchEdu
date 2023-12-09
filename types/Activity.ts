import { isThisTypeNode } from 'typescript';
import { Course, CourseArray } from './Course';
import { DaySched, DaySchedArray } from './DaySched';
import { Instructor, InstructorArray } from './Instructor';
import { Room, RoomArray } from './Room';
import { Section, SectionArray } from './Section';
import { ExtArray, ExtE } from './ExtendedArray';

export class ActivityArray extends ExtArray<Activity, ActivityParams>{
    
    constructor(...activities : Array<Activity[] | Activity>){
        super(...activities);
    }
}

export interface ActivityParams{
    start: number;
    duration: number;
    sched: DaySched | number;
    course: Course | string;
    room?: Room | string;
    instance: number;
}

export class Activity extends ExtE<Activity>{
    id: string;

    start_time: number;
    duration: number;
    sched: number;
    courseID: string;

    roomID?: string;
    instructorID?: string;
    sectionID?: string;

    instance: number = 0;

    room(arr: RoomArray){
        return arr.find(r => r.id === this.roomID);
    }

    course(arr: CourseArray) {
        return arr.find(c => c.id === this.courseID);
    }

    instructor(arr: InstructorArray) {
        return arr.find(i => i.id === this.instructorID);
    }

    section(arr: SectionArray) {
        return arr.find(s => s.id === this.sectionID);
    }

    change(v: Course | Room | Instructor | Section){
        if(v instanceof Course) this.courseID = v.id;
        else if(v instanceof Room) this.roomID = v.id;
        else if(v instanceof Instructor) this.instructorID = v.id;
        else if(v instanceof Section) this.sectionID = v.id;
    }

    get end(){
        return this.start_time + this.duration;
    }

    constructor({start, duration, course, sched, instance, room} : ActivityParams ){
        super();
        this.id = useGenID(8);
        this.start_time = start;
        this.duration = duration;
        this.sched = typeof sched === 'number' ? sched : sched.day;
        this.instance = instance;

        this.roomID = typeof room === 'string' ? room : room?.id;
        this.courseID = typeof course === 'string' ? course : course?.id;
    }

    equals(act: Activity){
        return this.id === act.id;
    }

    equalValue(act: Activity){
        return this.courseID === act.courseID &&
        this.roomID === act.roomID &&
        this.instructorID === act.instructorID &&
        this.sectionID === act.sectionID;
    }

    gen_isAPair(act: Activity){
        return this.instance === act.instance &&
            this.courseID === act.courseID &&
            this.roomID === act.roomID;
    }

    isConflict(a: Activity){
        if(a.id === this.id) return false;

        return (this.start_time < a.end && this.end > a.start_time) || 
        (a.start_time < this.end && a.end > this.start_time) ||
        (a.start_time === this.start_time) ||
        (a.end === this.end);
    }
    
    clone() : Activity {
        const clone = new Activity({
            start: this.start_time,
            duration: this.duration,
            course: this.courseID,
            sched: this.sched,
            instance: this.instance,
            room: this.roomID
        });

        clone.instructorID = this.instructorID
        clone.sectionID = this.sectionID;
        
        clone.id = this.id;

        return clone;
    }
}