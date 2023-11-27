import { RoomTypeArray, RoomArray, RoomType } from "./Room";
import { CourseArray, type Course } from "./Course";
import { Instructor, InstructorArray } from "./Instructor";
import { SectionArray, type Section } from "./Section";
import { Day, DaySched } from "./DaySched";

export class TimetableSettings{
    interval = 15;
    start = 420; // 7:00 AM
    end = 1140; // 7:00 PM
    exlude_periods: number[] = [720, 750]; // 12:00 , 12:30

    once_prio = [[3], [6], [1], [5], [2], [4]]; // Does this to support versatility on PutCourseToRooms
    twice_prio = [[2, 4], [1, 5], [3, 6]];
    thrice_prio = [[1, 3, 5], [2, 4, 6]];

    include_sat = true;
    room_types : RoomTypeArray = new RoomTypeArray().from(['Normal','#555555'],['Large', '#1E1B18'], ['ScienceLab', '#2D9E61'],['ComLab','#A78BFB']);

    // Constraints
    max_instructor_minutes_per_day = 480;
    max_student_minutes_per_day = 480;
    max_room_minutes_per_day = 480;
    max_consecutive_minutes = 240; // TODO: MAX_CONSEC_MINUTES
}

export interface TimetableParams{
    rooms: RoomArray;
    courses: CourseArray;
    instructors: InstructorArray;
    sections: SectionArray;
    settings?: TimetableSettings;
}

export const TimetableBuilder = () : TimetableParams => {
    return {
        rooms: new RoomArray(),
        courses: new CourseArray(),
        instructors: new InstructorArray(),
        sections: new SectionArray(),
        settings: new TimetableSettings()
    }
};

export class Timetable{

    settings: TimetableSettings = new TimetableSettings(); // Loads the default settings

    name: string = "Unnamed Timetable";
    rooms?: RoomArray;
    courses?: CourseArray;
    instructors?: InstructorArray;
    sections?: SectionArray;

    generate(params: TimetableParams){
        // We clone the parameters because thats how it is
        const { rooms, courses, instructors, sections, settings } = structuredClone(params);

        this.rooms = rooms;
        this.courses = courses;
        this.instructors = instructors;
        this.sections = sections;
        this.settings = settings || new TimetableSettings();

        // SUGGEST: Doesn't even needed to create a copy, a sorted courseArray does not matter much 
        // Get a copy of all courses then sort them by the amount of room types they are available
        const courseCopy = courses
            .toSorted((a, b) => a.compatible_rooms.length - b.compatible_rooms.length);

        // Original
        // for(let i = 1; i <= room_types.length || courseCopy.length > 0; i++){
        //     for(let j = 0; j < courseCopy.length; j++){
        //         const c = courseCopy[j];
        //         if(c.compatible_rooms.length === i){
        //             this.putCourseToRooms(c, rooms);
        //             courseCopy.remove(c);
        //             j--;
        //         }
        //     }
        // }

        // Rewritten
        courseCopy.forEach(c => this.putCourseToRooms(c, rooms));

        // SUGGEST: Same Here, doesn't need to be sorted
        // Get a copy of all instructors and sort the amount of courses they can teach
        const instructorCopy = instructors
            .toSorted((a, b) => a.compatible_courses.length - b.compatible_courses.length);

        // Original
        // for(let i = 1; i <= courses.length || instructorCopy.length > 0; i++){
        //     for(let j = 0; j < instructorCopy.length; j++){
        //         const inst = instructorCopy[j];
        //         if(inst.compatible_courses.length === i){
        //             this.putInstructorToRooms(inst, rooms, courses);
        //             instructorCopy.remove(inst);
        //             j--;
        //         }
        //     }
        // }

        // Rewritten
        instructorCopy.forEach(i => this.putInstructorToRooms(i, rooms, courses));

        // Distribute section to classes
        sections.forEach(s => this.putSectionToRooms(s, courses));

        // [ ]: Validate
        this.checkTimeTableHealth();
    }

    putCourseToRooms(c : Course, rooms: RoomArray){
        const { settings } = this;
        const { once_prio: once, twice_prio: twice, thrice_prio: thrice, include_sat } = settings;

        let { classes_offered, weekly_meetings: meetings } = c, instance = 1, duration = c.minutes / c.weekly_meetings;

        // Can't write the orginal, too long, that's what she said

        const quadrice = once.map(([p]) => once.flat().filter(a => a !== p));
        const quantrice = [[1,2,3,4,5]];
        const hexrice = [[1,2,3,4,5,6]];

        // Loop through the compatible room types of the course as Course Compatible Roomtype (CCR)
        c.compatible_rooms.forEach(ccr => {
            // Loop through all the rooms and put course to the room that is available and compatible
            rooms.forEach(r => {
                if(classes_offered === 0) return; // Guard clause, not needed daw
                if(!r.type.equals(ccr)) return;

                const prio : number[][] = [once, twice, thrice, quadrice, quantrice, hexrice][meetings - 1];

                prio.forEach(p => {
                    if(classes_offered === 0) return; // Guard clause, not needed daw
                    if(!include_sat && p.includes(Day.SAT)) return;

                    // i + 1, since prio days starts with 1, while room scheds starts at 0, I think
                    const scheds : DaySched[] = r.scheds.filter((s, i) => p.includes(i + 1)); 
                    while(classes_offered !== 0){
                        const success = scheds.every(s => s.checkConflict(duration));
                        if(success){
                            scheds.forEach(s => s.addActivity(c, duration, instance));
                            classes_offered--;
                            instance++;
                        }else break;
                    }
                })

            })
        })
    }

    putInstructorToRooms(t: Instructor, rooms: RoomArray, courses: CourseArray){

    }

    putSectionToRooms(s: Section, courses: CourseArray){

    }
    print(){

    }

    checkTimeTableHealth(){
        // TODO: Also check the timetable's mana haha
    }
}