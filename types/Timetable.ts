import { RoomTypeArray, RoomArray, RoomType } from "./Room";
import { CourseArray, type Course } from "./Course";
import { Instructor, InstructorArray } from "./Instructor";
import { SectionArray, type Section } from "./Section";
import { Day, DaySched } from "./DaySched";
import type { Activity } from "./Activity";

export class TimetableSettings {
    interval = 30;
    start = 420; // 7:00 AM
    end = 1140; // 7:00 PM
    excluded_periods: number[] = [720, 750]; // 12:00 , 12:30

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
        const { settings } = this, DEV_MODE = false;
        const { once_prio: once, twice_prio: twice, thrice_prio: thrice, include_sat } = settings;

        let { classes_offered, weekly_meetings: meetings } = c, instance = 1, duration = c.minutes / c.weekly_meetings;
        
        // Can't write the orginal, too long, that's what she said

        const quadrice = once.map(([p]) => once.flat().filter(a => a !== p));
        const quantrice = [[1, 2, 3, 4, 5]];
        const hexrice = [[1, 2, 3, 4, 5, 6]];

        if(DEV_MODE) console.log(`Putting rooms to Course: `, c);

        // Loop through the compatible room types of the course as Course Compatible Roomtype (CCR)
        c.compatible_rooms.forEach(ccr => {
            // Loop through all the rooms and put course to the room that is available and compatible
            this.rooms.forEach(r => {
                if (classes_offered === 0) return; // Guard clause, not needed daw
                if (!r.type.equals(ccr)) return;

                if(DEV_MODE) console.log(`Attempt to add it on Room: `, r);

                const prio: number[][] = [once, twice, thrice, quadrice, quantrice, hexrice][meetings - 1];

                if(DEV_MODE) console.log(`Chosen Priority: `, prio);

                prio.forEach(p => {
                    if (classes_offered === 0) return; // Guard clause, not needed daw
                    if (!include_sat && p.includes(Day.SAT)) return;

                    // i + 1, since prio days starts with 1, while room scheds starts at 0, I think
                    const scheds: DaySched[] = r.scheds.filter(s => p.includes(s.day));

                    if(DEV_MODE) console.log(`Current Priority: ${p} has these scheds: `, scheds);

                    while (classes_offered !== 0) {
                        const success = meetings === 1 || scheds.every(s => s.checkConflict(duration));
                        if (success) {
                            const status = scheds.every(s => s.addActivity(c, duration, instance));
                            if(status){
                                classes_offered--;
                                instance++;
                            }
                            else{
                                if(DEV_MODE) console.log('Failed Tho');
                                break;
                            }
                        } else break;
                    }
                })

            })
        })
    }

    putInstructorToRooms(t: Instructor) {
        const { settings, rooms } = this, DEV_MODE = false;
        const { once_prio: once, twice_prio: twice, thrice_prio: thrice, include_sat } = settings;

        const GetAllInstance = (arr: Activity[], inst: number) : Activity[] => arr.filter(a => a.instance === inst);

        // Can't write the orginal, too long, that's what she said

        const quadrice = once.map(([p]) => once.flat().filter(a => a !== p));
        const quantrice = [[1, 2, 3, 4, 5]];
        const hexrice = [[1, 2, 3, 4, 5, 6]];

        if(DEV_MODE) console.log(`%c--- Putting course to instructor: ---`, 'color:yellow;', t);

        // Loop through all the instructors compatible courses
        t.compatible_courses.forEach(tcc => {
            // Loop through all the rooms and find an activity where the said course is in
            const { weekly_meetings: meetings } = tcc;
            const prio: number[][] = [once, twice, thrice, quadrice, quantrice, hexrice][meetings - 1];

            if(DEV_MODE) console.log(`Trying to add course: `, tcc);

            rooms.forEach(r => {
                
                if(DEV_MODE) console.log(`Trying on this room: `, r);
                
                r.scheds.forEach(s => {

                    const pairs = prio.find(p => p.includes(s.day));
                    const room_scheds = r.scheds.filter(sc => pairs?.includes(sc.day));
                    const inst_scheds = t.scheds.filter(sc => pairs?.includes(sc.day));

                    if(DEV_MODE) console.log(`On Day ${s.day} (${Day[s.day]}): `, pairs);
                    
                    s.activities.forEach(a => {

                        const pair_acts = room_scheds.map(sc => GetAllInstance(sc.activities, a.instance)[0]);

                        if(DEV_MODE) console.log(`Pair acts: `, JSON.parse(JSON.stringify(pair_acts)));

                        const acts_exists = pair_acts.every(p => !!p);
                        const acts_no_instructor = pair_acts.every(p => !p.instructorID);
                        const inst_vacant = inst_scheds.every((sc, sci) => sc.checkVacant(pair_acts[sci].start_time, pair_acts[sci].duration));
                        const acts_equal_course = pair_acts.every(p => p.courseID === tcc.id);
                        const inst_have_minutes = t.addMinutes(tcc.minutes);

                        if(
                            acts_exists && // Make sure all pair activities are present
                            acts_no_instructor && // Make sure all pair activities have no assigned instructor
                            inst_vacant &&
                            acts_equal_course &&
                            inst_have_minutes
                        ){
                            pair_acts.forEach(p => p.instructorID = t.id);
                            // Set activity instructor and clone it
                            a.instructorID = t.id;
                            inst_scheds.forEach(sc => sc.addExistingActivity(a));

                            if(DEV_MODE) console.log(`%cSuccessfully Added Activity`, 'color:green;');
                        }else if(DEV_MODE){
                            console.log(`%cFailed Tho: %c${[
                                {label: `Acts don't exist`, value: acts_exists},
                                {label: `Acts has instructor`, value: acts_no_instructor},
                                {label: `Instructor is not vacant`, value: inst_vacant},
                                {label: `Acts not the same course`, value: acts_equal_course},
                                {label: `Instructor has no minutes`, value: inst_have_minutes}
                            ].filter(status => !status.value).map(status => status.label).join(' | ')}`, `color:red;`, `color: orange;`);
                        }

                    })

                })

            })
        })
    }

    putSectionToRooms(s: Section) {
        // return;
        s.section_courses.forEach(c => {
            let { weekly_meetings: meetings } = c;
            c.course_classes.forEach(a => {
                if(meetings <= 0) return; // Guard Clause
                if(!a.sectionID && meetings > 0){
                    a.sectionID = s.id;
                    s.scheds.find(sc => sc.day === a.sched)?.addExistingActivity(a);
                    meetings--;
                }
            })
        })
    }
    print() {

    }

    checkTimeTableHealth() {
        // TODO: Also check the timetable's mana haha
    }
}