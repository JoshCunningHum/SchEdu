import { useGenID } from "~/composables/useGenID";
import { ActivityArray, type Activity } from "./Activity";
import { RoomTypeArray, type RoomType } from "./Room";

export class CourseArray extends Array<Course>{

    constructor(...courses: Array<Course | Course[]>){
        super();
        this.push(...courses.flat());
    }

    indexOf(course: Course){
        return this.findIndex(c => c.id === course.id);
    }

    remove(course: Course){
        const i = this.indexOf(course);
        (i !== -1) && this.splice(i, 1);
    }
}

export interface CourseParams{
    name: string;
    minutes: number;
    meetings: number;
    classes_offered: number;
    room_types:RoomTypeArray;
}

export class Course{
    id : string;
    name: string;

    /**Course duration in one week. Should be automatically set depends on the amount of load.*/
    minutes: number; 
    /**Number of meetings per week in one class. */
    weekly_meetings: number;
    /**Number of classes this course is offered in. Shouldn't be confused with the length of course_classes */
    classes_offered: number;
    /**Types of room that this course is compatible with. */
    compatible_rooms: RoomTypeArray;
    /**Activities that this course is in.*/
    course_classes: ActivityArray = new ActivityArray();

    constructor({name, minutes, meetings, classes_offered, room_types} : CourseParams){
        this.id = useGenID(8);
        this.name = name || `Course ${this.id}`;
        this.minutes = minutes || 0;
        this.weekly_meetings = meetings || 0;
        this.classes_offered = classes_offered || 0;
        this.compatible_rooms = room_types || new RoomTypeArray();
    }

    // For debugging
    print(){
        // TODO: Print
        console.log(``);
    }
}