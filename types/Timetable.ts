import { RoomTypeArray, RoomArray, RoomType } from "./Room";
import { CourseArray, type Course } from "./Course";
import { Instructor, InstructorArray } from "./Instructor";
import { SectionArray, type Section } from "./Section";
import { Day, DaySched } from "./DaySched";

export class TimetableSettings {
    interval = 30;
    start = 420; // 7:00 AM
    end = 1140; // 7:00 PM
    exlude_periods: number[] = [720, 750]; // 12:00 , 12:30

    once_prio = [[3], [6], [1], [5], [2], [4]]; // Does this to support versatility on PutCourseToRooms
    twice_prio = [[2, 4], [1, 5], [3, 6]];
    thrice_prio = [[1, 3, 5], [2, 4, 6]];

    include_sat = true;
    room_types: RoomTypeArray = new RoomTypeArray().from(['Normal', '#555555'], ['Large', '#1E1B18'], ['ScienceLab', '#2D9E61'], ['ComLab', '#A78BFB']);

    // Constraints
    max_instructor_minutes_per_day = 480;
    max_student_minutes_per_day = 480;
    max_room_minutes_per_day = 480;
    max_consecutive_minutes = 240; // TODO: MAX_CONSEC_MINUTES
}

export interface TimetableParams {
    rooms: RoomArray;
    courses: CourseArray;
    instructors: InstructorArray;
    sections: SectionArray;
    settings?: TimetableSettings;
}

export const TimetableBuilder = (): TimetableParams => {
    return {
        rooms: new RoomArray(),
        courses: new CourseArray(),
        instructors: new InstructorArray(),
        sections: new SectionArray(),
        settings: new TimetableSettings()
    }
};

export class Timetable {

    settings: TimetableSettings = new TimetableSettings(); // Loads the default settings
    
    rooms: RoomArray = new RoomArray();
    courses: CourseArray = new CourseArray();
    instructors: InstructorArray = new InstructorArray();
    sections: SectionArray = new SectionArray();

    generate(params: TimetableParams) {
        // We clone the parameters because thats how it is
        const { rooms, courses, instructors, sections, settings } = params;

        // TODO: Put timeout when generation takes too long
        this.rooms = rooms;
        this.courses = courses;
        this.instructors = instructors;
        this.sections = sections;
        this.settings = settings || new TimetableSettings();

        console.log("Inputs: ", rooms, courses, instructors, sections, this.settings);


        // SUGGEST: Doesn't even needed to create a copy, a sorted courseArray does not matter much 
        // Get a copy of all courses then sort them by the amount of room types they are available
        courses.sort((a, b) => a.compatible_rooms.length - b.compatible_rooms.length);

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
        courses.forEach(c => this.putCourseToRooms(c));

        // SUGGEST: Same Here, doesn't need to be sorted
        // Get a copy of all instructors and sort the amount of courses they can teach
        instructors.sort((a, b) => a.compatible_courses.length - b.compatible_courses.length);

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
        instructors.forEach(i => this.putInstructorToRooms(i));

        // Distribute section to classes
        sections.forEach(s => this.putSectionToRooms(s));

        // [ ]: Validate
        this.checkTimeTableHealth();
    }

    putCourseToRooms(c: Course) {
        const { settings } = this;
        const { once_prio: once, twice_prio: twice, thrice_prio: thrice, include_sat } = settings;

        let { classes_offered, weekly_meetings: meetings } = c, instance = 1, duration = c.minutes / c.weekly_meetings;
        
        // Can't write the orginal, too long, that's what she said

        const quadrice = once.map(([p]) => once.flat().filter(a => a !== p));
        const quantrice = [[1, 2, 3, 4, 5]];
        const hexrice = [[1, 2, 3, 4, 5, 6]];

        console.log(`Putting rooms to Course: `, c);

        // Loop through the compatible room types of the course as Course Compatible Roomtype (CCR)
        c.compatible_rooms.forEach(ccr => {
            // Loop through all the rooms and put course to the room that is available and compatible
            this.rooms.forEach(r => {
                if (classes_offered === 0) return; // Guard clause, not needed daw
                if (!r.type.equals(ccr)) return;

                console.log(`Attempt to add it on Room: `, r);

                const prio: number[][] = [once, twice, thrice, quadrice, quantrice, hexrice][meetings - 1];

                console.log(`Chosen Priority: `, prio);

                prio.forEach(p => {
                    if (classes_offered === 0) return; // Guard clause, not needed daw
                    if (!include_sat && p.includes(Day.SAT)) return;

                    // i + 1, since prio days starts with 1, while room scheds starts at 0, I think
                    const scheds: DaySched[] = r.scheds.filter((s, i) => p.includes(i + 1));

                    console.log(`Current Priority: ${p} has these scheds: `, scheds);

                    while (classes_offered !== 0) {
                        const success = meetings === 1 || scheds.every(s => s.checkConflict(duration));
                        if (success) {
                            const status = scheds.every(s => s.addActivity(c, duration, instance));
                            if(status){
                                classes_offered--;
                                instance++;
                            }
                            else{
                                console.log('Failed Tho');
                                break;
                            }
                        } else break;
                    }
                })

            })
        })
    }

    putInstructorToRooms(t: Instructor) {

    }

    putSectionToRooms(s: Section) {

    }
    print() {

    }

    checkTimeTableHealth() {
        // TODO: Also check the timetable's mana haha
    }
}