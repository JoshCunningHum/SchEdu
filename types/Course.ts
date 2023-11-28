import { useGenID } from "~/composables/useGenID";
import { ActivityArray, type Activity } from "./Activity";
import { RoomTypeArray, type RoomType } from "./Room";
import { ExtArray, ExtE } from "./ExtendedArray";

export class CourseArray extends ExtArray<Course, CourseParams>{

    constructor(...courses: Array<Course | Course[]>){
        super(...courses);
    }
}

export interface CourseParams{
    name: string;
    minutes: number;
    meetings: number;
    classes_offered: number;
    room_types:RoomTypeArray;
}

export class Course extends ExtE<Course>{
    id : string;
    name: string;

    /**Course duration in one week. Should be automatically set depends on the amount of load.*/
    minutesPersession: number; 
    /**Number of meetings per week in one class. */
    weekly_meetings: number;
    /**Number of classes this course is offered in. Shouldn't be confused with the length of course_classes */
    classes_offered: number;
    /**Types of room that this course is compatible with. */
    compatible_rooms: RoomTypeArray;
    /**Activities that this course is in.*/
    course_classes: ActivityArray = new ActivityArray();

    get minutes(){
        return this.minutesPersession * this.weekly_meetings;
    }

    set minutes(v){
        this.minutesPersession = v / this.weekly_meetings;
    }

    constructor({name, minutes, meetings, classes_offered, room_types} : CourseParams){
        super();
        this.id = useGenID(8);
        this.name = name || `Course ${this.id}`;
        this.weekly_meetings = meetings || 0;
        this.minutes = minutes || 0;
        this.minutesPersession = minutes / meetings;
        this.classes_offered = classes_offered || 0;
        this.compatible_rooms = room_types || new RoomTypeArray();
    }

    equals(obj: Course){
        return obj.id === this.id;
    }

    // For debugging
    print(){
        // TODO: Print
        console.log(``);
    }
}