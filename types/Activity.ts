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
    sched: DaySched;
    course?: Course;
    room?: Room;
    instance: number;
}

export class Activity{
    id: string;

    start_time: number;
    duration: number;
    sched: number;

    courseID?: string;
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
        this.sched = sched.day;
        this.instance = instance;

        this.roomID = room?.id;
        this.courseID = course?.id;
    }

    equals(act: Activity){
        return this.start_time === act.start_time && this.duration === act.duration && this.sched === act.sched;
    }
}