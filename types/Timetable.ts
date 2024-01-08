import { RoomTypeArray, RoomArray, RoomType } from "./Room";
import { CourseArray, type Course } from "./Course";
import { Instructor, InstructorArray } from "./Instructor";
import { SectionArray, type Section } from "./Section";
import { Day, DaySched } from "./DaySched";
import { ActivityArray, type Activity } from "./Activity";

export interface TimeTableOutput extends Timetable{}

export interface TimetableData {
    sched: TimeTableOutput,
    params: TimetableParams
}

export interface TimeTableModel{
    id: number;
    created: string;
    by: string;
    name: string;
    // HACK: This property is a string inside the database, this is to avoid excessive changes on both the codebase and the database model, once the Timetable Datastructure is finalized, this will be resolve
    data: TimetableData | null;
}

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
    max_instructor_minutes_per_day = Number.MAX_SAFE_INTEGER;
    max_student_minutes_per_day = Number.MAX_SAFE_INTEGER;
    max_room_minutes_per_day = Number.MAX_SAFE_INTEGER;
    max_consecutive_minutes = Number.MAX_SAFE_INTEGER; // TODO: MAX_CONSEC_MINUTES
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

    activities: ActivityArray = new ActivityArray();

    generate(params: TimetableParams) {
        // We clone the parameters because thats how it is
        const { rooms, courses, instructors, sections, settings } = params;

        // TODO: Put timeout when generation takes too long
        this.rooms = rooms;
        this.courses = courses;
        this.instructors = instructors;
        this.sections = sections;
        this.settings = settings || new TimetableSettings();
        this.activities = new ActivityArray(); // Delete all activities

        console.log("Inputs: ", rooms, courses, instructors, sections, this.settings);

        const MAX_ATTEMPTS = sections.length * courses.length + 1;
        Array<number>(MAX_ATTEMPTS).fill(0).some((_, i) => {
            // We use some in this case since it will automatically stop when we return true
            
            courses.sort((a, b) => a.compatible_rooms.length - b.compatible_rooms.length);
            courses.forEach(c => this.putCourseToRooms(c, i)); // We pass the class offering adjustment

            instructors.sort((a, b) => a.compatible_courses.length - b.compatible_courses.length);
            instructors.forEach(i => this.putInstructorToRooms(i));

            sections.forEach(s => this.putSectionToRooms(s));

            this.removeNoSection();

            if(this.checkSectionCompletion()){
                console.log(`Completed after ${i} increments`);
                return true;
            }

            if(i < MAX_ATTEMPTS - 1) this.reset();

            return false;
        })


        // [ ]: Validate
        this.checkTimeTableHealth();
    }

    putCourseToRooms(c: Course, class_offering_adjustment: number = 0) {
        const { settings } = this, DEV_MODE = true;
        const { once_prio: once, twice_prio: twice, thrice_prio: thrice } = settings;

        let { weekly_meetings: meetings } = c, instance = 1, duration = c.minutes / c.weekly_meetings;
        
        // classes offered now depends on how many sections needs that course + adjustment
        let classes_offered = this.sections.reduce((acc, s) => acc += s.section_courses.some(co => co.equals(c)) ? 1 : 0, class_offering_adjustment);

        // Can't write the orginal, too long, that's what she said

        const quadrice = once.map(([p]) => once.flat().filter(a => a !== p));
        const quantrice = [[1, 2, 3, 4, 5]];
        const hexrice = [[1, 2, 3, 4, 5, 6]];

        if(DEV_MODE) console.log(`Putting rooms to Course: `, c, classes_offered);

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

                    // i + 1, since prio days starts with 1, while room scheds starts at 0, I think
                    const scheds: DaySched[] = r.scheds.filter(s => p.includes(s.day));

                    if(DEV_MODE) console.log(`Current Priority: ${p} has these scheds: `, scheds);

                    while (classes_offered !== 0) {
                        const success = (meetings === 1 || scheds.every(s => s.checkConflict(duration))) && scheds.every(s => s.checkViolation(r, duration));
                        if (success) {
                            const added_activities = scheds.map(s => s.addActivity(c, duration, instance, r));

                            const status = added_activities.every(act => !!act);

                            if(status){
                                classes_offered--;
                                instance++;
                                // For some reason, typescript don't recognize the result of a filter
                                // It is understandable that typescript won't recognize that when code enters this block, all items in added_activities is surely not null
                                added_activities.forEach(a => !!a && this.activities.push(a));
                                if(DEV_MODE) console.log(`%cSuccessfully Added Course`, 'color:green;');
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
        const { settings, rooms } = this, DEV_MODE = true;
        const { once_prio: once, twice_prio: twice, thrice_prio: thrice } = settings;

        const GetAllInstance = (arr: Activity[], inst: number, course: string) : Activity[] => arr.filter(a => a.instance === inst && a.courseID === course);

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
                    if(!pairs) return;
                    const room_scheds = r.scheds.filter(sc => pairs.includes(sc.day));
                    const inst_scheds = t.scheds.filter(sc => pairs.includes(sc.day));

                    if(DEV_MODE) console.log(`On Day ${s.day} (${Day[s.day]}): `, pairs, room_scheds.map(sc => sc.day), inst_scheds.map(inst => inst.day));
                    
                    s.activities.forEach(a => {

                        const pair_acts = this.activities.filter(act => act.gen_isAPair(a));

                        if(DEV_MODE) console.log(`Pair acts: `, JSON.parse(JSON.stringify(pair_acts)));

                        const acts_exists = pair_acts.every(p => !!p);
                        const acts_no_instructor = pair_acts.every(p => !p.instructorID);

                        if(pair_acts.length !== pairs.length) return;

                        const inst_vacant = inst_scheds.every((sc, sci) => sc.checkVacant(pair_acts[sci].start_time, pair_acts[sci].duration));
                        const acts_equal_course = pair_acts.every(p => p.courseID === tcc.id);
                        const inst_have_minutes = t.checkMinutes(a.course(this.courses)?.minutes || tcc.minutes);
                        const follows_constraint = inst_scheds.every((sc, sci) => sc.checkViolation(t, pair_acts[sci].duration));

                        if(
                            acts_exists && // Make sure all pair activities are present
                            acts_no_instructor && // Make sure all pair activities have no assigned instructor
                            inst_vacant &&
                            acts_equal_course &&
                            inst_have_minutes &&
                            follows_constraint
                        ){
                            pair_acts.forEach(p => p.instructorID = t.id);
                            // Set activity instructor and clone it
                            a.instructorID = t.id;
                            inst_scheds.forEach((sc, i) => sc.addExistingActivity(pair_acts[i]));
                            t.addMinutes(tcc.minutes);

                            if(DEV_MODE) console.log(`%cSuccessfully Added Activity`, 'color:green;');
                        }else if(DEV_MODE){
                            console.log(`%cFailed Tho: %c${[
                                {label: `Acts don't exist`, value: acts_exists},
                                {label: `Acts has instructor`, value: acts_no_instructor},
                                {label: `Instructor is not vacant`, value: inst_vacant},
                                {label: `Acts not the same course`, value: acts_equal_course},
                                {label: `Instructor has no minutes`, value: inst_have_minutes},
                                {label: `Doesn't follow constraints`, value: follows_constraint}
                            ].filter(status => !status.value).map(status => status.label).join(' | ')}`, `color:red;`, `color: orange;`);
                        }

                    })

                })

            })
        })
    }

    putSectionToRooms(s: Section) {
        // return;
        const DEV_MODE = true;

        if(DEV_MODE) console.log(`%c--- Putting Section: ---`, 'color:yellow;', s);

        s.section_courses.forEach(c => {
            let { weekly_meetings: meetings } = c;

            if(DEV_MODE) console.log(`To course: `, c);

            c.course_classes.forEach(a => {

                if(DEV_MODE) console.log(`Attempt to add activity:`, a);
                const sched = s.scheds[a.sched - 1];
                if(!sched) return;

                const hasNoSection = !a.sectionID,
                    hasAvailableMeetings = meetings > 0,
                    hasNoConflict = s.scheds[a.sched - 1].checkVacant(a.start_time, a.duration),
                    hasNoViolation = sched.checkViolation(s, a.duration);

                if(
                    hasNoSection &&
                    hasAvailableMeetings &&
                    hasNoConflict &&
                    hasNoViolation    
                ){
                    a.sectionID = s._id;
                    s.scheds[a.sched - 1].addExistingActivity(a);
                    meetings--;
                    if(DEV_MODE) console.log(`%cSuccessfully Added Activity`, 'color:green;');
                }else if(DEV_MODE){
                    console.log(`%cFailed Tho: %c${[
                        {label: `Act has a section`, value: hasNoSection},
                        {label: `Meeting is now less than 0`, value: hasAvailableMeetings},
                        {label: `Conflict on vacancy`, value: hasNoConflict},
                        {label: `Violation`, value: hasNoViolation}
                    ].filter(status => !status.value).map(status => status.label).join(' | ')}`, `color:red;`, `color: orange;`);
                }
            })
        })
    }

    checkSectionCompletion() : boolean {
        return this.sections.every(s => 
            s.section_courses.every(c => 
                c.course_classes.some(a => a.sectionID === s._id)));
    }

    removeNoSection(){
        // Get all activities with no section in it
        const nosections = this.activities.filter(a => !a.sectionID);
        // Loop through all the activies with no sections and remove their traces hehe
        nosections.forEach(a => {
            a.room(this.rooms)?.scheds.removeAct(a);
            a.instructor(this.instructors)?.scheds.removeAct(a);
            a.course(this.courses)?.course_classes.remove(a);

            // Below is not possible because obviously
            // a.section(this.sections)?.scheds.removeAct(a);

            // Then remove it in the activities array
            this.activities.remove(a);
        })
    }

    reset(){
        this.rooms.forEach(r => r.scheds.reset());
        this.courses.forEach(c => c.course_classes.splice(0));
        this.instructors.forEach(i => {
            i.scheds.reset();
            i.total_minutes = 0;
        });
        this.sections.forEach(s => s.scheds.reset());
        this.activities.splice(0);
    }

    print() {

    }

    checkTimeTableHealth() {
        // TODO: Also check the timetable's mana haha
    }
}