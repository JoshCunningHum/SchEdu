import { isThisTypeNode } from 'typescript';
import { Course, CourseArray } from './Course';
import { DaySched, DaySchedArray } from './DaySched';
import { Instructor, InstructorArray } from './Instructor';
import { Room, RoomArray } from './Room';
import { Section, SectionArray } from './Section';

export class ActivityArray extends Array<Activity>{
    
    constructor(...activities : Array<Activity[] | Activity>){
        super();
        this.push(...activities.flat());
    }

    add(params: ActivityParams | Activity) : Activity {
        const n = params instanceof Activity ? params : new Activity(params);
        this.push(n);
        return n;
    }

    indexOf(act: Activity){
        return this.findIndex(a => a.equals(act));
    }

    remove(act: Activity){
        const i = this.indexOf(act);
        (i !== -1) && this.splice(i, 1);
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

export class Activity{
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

    get end(){
        return this.start_time + this.duration;
    }

    constructor({start, duration, course, sched, instance, room} : ActivityParams ){
        this.id = useGenID(8);
        this.start_time = start;
        this.duration = duration;
        this.sched = typeof sched === 'number' ? sched : sched.day;
        this.instance = instance;

        this.roomID = typeof room === 'string' ? room : room?.id;
        this.courseID = typeof course === 'string' ? course : course?.id;
    }

    equals(act: Activity){
        return this.start_time === act.start_time && 
        this.duration === act.duration && 
        this.sched === act.sched && 
        (!this.courseID || !act.courseID || this.courseID === act.courseID) &&
        (!this.roomID || !act.roomID || this.roomID ===  act.courseID) &&
        (!this.instructorID || !act.instructorID || this.instructorID === act.instructorID) &&
        (!this.sectionID || !act.sectionID || this.sectionID === act.sectionID)
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