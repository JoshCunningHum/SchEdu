import { Course } from './Course';
import { DaySched } from './DaySched';
import { Instructor } from './Instructor';
import { Room } from './Room';
import { Section } from './Section';

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
    course: Course;
    sched: DaySched;
    instance: number;
}

export class Activity{
    start_time: number;
    duration: number;
    course: Course;

    room?: Room;
    sched: DaySched;
    instructor?: Instructor;
    section?: Section;
    instance: number = 0;


    get end(){
        return this.start_time + this.duration;
    }

    constructor({start, duration, course, sched, instance} : ActivityParams ){
        this.start_time = start;
        this.duration = duration;
        this.course = course;
        this.sched = sched;
        this.instance = instance;
    }

    equals(act: Activity){
        return this.start_time === act.start_time && this.duration === act.duration && this.sched.day === act.sched.day;
    }
}