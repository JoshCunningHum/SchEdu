import { Activity, ActivityArray } from "./Activity";
import { Course, CourseArray } from "./Course";
import { DaySched, DaySchedArray } from "./DaySched";
import { Instructor, InstructorArray } from "./Instructor";
import { Room, RoomArray, RoomType, RoomTypeArray } from "./Room";
import { Section, SectionArray } from "./Section";
import { Timetable, TimetableBuilder, type TimetableParams } from "./Timetable";

// Serializes the timetable data. Can also do parsing
export class Serializer{

    /**Fixes all references from a parsed TimeTableParams. Used for parsing the data from the databaase so that it will be reactive.*/
    static fix(data: Timetable) : Timetable | null {

        // We should expect that each instances of parameters that contains an instance of other parameters do not reference them, those that contains only has the exact copy but not the exact object in the memory

        // We should also expect that these object do not represent the actual objects types, they are not instances of each classes we made, because classes are outdated as fuck

        let { rooms, courses, instructors, sections, settings } = data;
        
        const def_params = TimetableBuilder();

        if(!rooms) rooms = new RoomArray();
        if(!courses) courses = new CourseArray();
        if(!instructors) instructors = new InstructorArray();
        if(!sections) sections = new SectionArray();

        if(!settings) throw new Error("No settings in the parameters!");

        if(!settings.excluded_periods && !!def_params.settings) settings.excluded_periods = def_params.settings.excluded_periods;
    
        // Reminder: to treat extended arrays in the `data` as arrays, since they are extracted from JSON.parse, they are not an instance of ExtArray and therefore does not have the extra method it has

        // RoomTypes
        const { room_types } = settings;

        const f_room_types = new RoomTypeArray();
        room_types.forEach(r => {
            // Also copy the id
            const n = new RoomType({name: r.name, color: r.color});
            n.id = r.id;
            f_room_types.add(n);
        })
        // Apply the RoomType to the settings
        settings.room_types = f_room_types;

        // Rooms
        const f_rooms = new RoomArray();
        rooms.forEach(r => {
            // Get associated Room Type
            const type = f_room_types.get(r.type);
            if(type === undefined){
                console.warn(`Missing RoomType was found when fixing references of Rooms`, r.type);
                return;
            }


            // Do not forget to copy the id
            const n = new Room({type, settings, name: r.name});

            // Replicate DayArray
            r.scheds.forEach((r, i) => {

                const activities = new ActivityArray();
                r.activities.forEach(a => {
                    const n = new Activity({
                        start: a.start_time,
                        duration: a.duration,
                        sched: new DaySched({day: a.sched, settings: settings}),
                        instance: a.instance,
                        course: a.courseID
                    });

                    // Assign other optional properties
                    n.courseID = a.courseID;
                    n.roomID = a.roomID;
                    n.instructorID = a.instructorID;
                    n.sectionID = a.sectionID;
                    n.id = a.id;

                    activities.push(n);
                });

                n.scheds[i].activities = activities;
            })

            n.id = r.id;
            f_rooms.add(n);
        });

        // Courses
        const f_courses = new CourseArray();
        courses.forEach(c => {
            // Replicate the RoomTypeArray first
            const compatible_rooms = new RoomTypeArray();
            c.compatible_rooms.forEach(t => {
                const type = f_room_types.get(t);
                if(type === undefined){
                    console.warn(`Missing RoomType was found when fixing references on one of the courses`, t);
                    return;
                }
                compatible_rooms.add(type);
            })

            // Replicate any Activities
            const activities = new ActivityArray();
            c.course_classes.forEach(a => {
                let n = f_rooms.flatMap(r => r.scheds.flatMap(sc => sc.activities.map(a => a))).find(ac => ac.id === a.id);
                
                n = !! n ? n : new Activity({
                    start: a.start_time,
                    duration: a.duration,
                    sched: new DaySched({day: a.sched, settings: settings}),
                    instance: a.instance,
                    course: a.courseID
                });

                // Assign other optional properties
                n.courseID = a.courseID;
                n.roomID = a.roomID;
                n.instructorID = a.instructorID;
                n.sectionID = a.sectionID;
                n.id = a.id;

                activities.push(n);
            });

            // Do not forget to copy the id
            const n = new Course({ 
                name: c.name, 
                minutes: c.minutesPersession * c.weekly_meetings, 
                meetings: c.weekly_meetings,
                room_types: compatible_rooms});

            n.id = c.id;
            n.course_classes = activities;

            f_courses.add(n);
        })

        // Teachers/Instructors
        const f_instructors = new InstructorArray();
        instructors.forEach(i => {
            // Replicate CourseArray first
            const compatible_courses = new CourseArray();
            i.compatible_courses.forEach(c => {
                const course = f_courses.get(c);
                if(course === undefined){
                    console.warn(`Missing Course was found when fixing references on one of the instructors`, c);
                    return;
                }
                compatible_courses.add(course);
            })

            // Then Replicate Scheds
            const scheds = new DaySchedArray();
            i.scheds.forEach(d => {
                
                // We don't need to find the reference here, since they'all have their own sched array, we only need to re-instantiate so that it represents the class

                // However we do need to find the Associated Room so there's that, if any

                const s = new DaySched({
                    day: d.day,
                    start: d.period_start,
                    end: d.period_end,
                    settings
                });

                scheds.add(s);
            });

            // Do not forget to copy the ID and scheds
            const n = new Instructor({
                name: i.name,
                compatible_courses,
                settings,
                period_start: settings.start,
                period_end: settings.end
            });
            n.id = i.id;
            n.scheds = scheds;
            
            // Replicate DayArray
            i.scheds.forEach((r, i) => {

                const activities = new ActivityArray();
                r.activities.forEach(a => {
                    let n = f_rooms.flatMap(r => r.scheds.flatMap(sc => sc.activities.map(a => a))).find(ac => ac.id === a.id);
                    
                    n = !! n ? n : new Activity({
                        start: a.start_time,
                        duration: a.duration,
                        sched: new DaySched({day: a.sched, settings: settings}),
                        instance: a.instance,
                        course: a.courseID
                    });

                    // Assign other optional properties
                    n.courseID = a.courseID;
                    n.roomID = a.roomID;
                    n.instructorID = a.instructorID;
                    n.sectionID = a.sectionID;
                    n.id = a.id;

                    activities.push(n);
                });

                n.scheds[i].activities = activities;
            })

            f_instructors.add(n);
        })

        const f_sections = new SectionArray();
        sections.forEach(s => {
            // Replicate CourseArray first
            const section_courses = new CourseArray();
            s.section_courses.forEach(c => {
                const course = f_courses.get(c);
                if(course === undefined){
                    console.warn(`Missing Course was found when fixing references on one of the sections`, c);
                    return;
                }
                section_courses.add(course);
            });

            // Do not forget to copy the ID
            const n = new Section({
                section_courses,
                settings,
                id: s.id
            });

            
            // Replicate DayArray
            s.scheds.forEach((r, i) => {

                const activities = new ActivityArray();
                r.activities.forEach(a => {
                    let n = f_rooms.flatMap(r => r.scheds.flatMap(sc => sc.activities.map(a => a))).find(ac => ac.id === a.id);
                    
                    n = !! n ? n : new Activity({
                        start: a.start_time,
                        duration: a.duration,
                        sched: new DaySched({day: a.sched, settings: settings}),
                        instance: a.instance,
                        course: a.courseID
                    });

                    // Assign other optional properties
                    n.courseID = a.courseID;
                    n.roomID = a.roomID;
                    n.instructorID = a.instructorID;
                    n.sectionID = a.sectionID;
                    n.id = a.id;

                    activities.push(n);
                });

                n.scheds[i].activities = activities;
            })
            

            f_sections.add(n);
        })

        const n = new Timetable();
        n.settings = settings;
        n.rooms = f_rooms;
        n.courses = f_courses;
        n.instructors = f_instructors;
        n.sections = f_sections;

        return n;
    }

    /**Extracts the parameters from vue's reactivity. Used for generating the timetable */
    static extract(data: TimetableParams) : TimetableParams | null {
        const freed = JSON.parse(JSON.stringify(data)) as Timetable;
        const fixed = this.fix(freed);

        if(!fixed) return null;

        let { rooms, courses, instructors, sections, settings } = fixed;

        if(!rooms) rooms = new RoomArray();
        if(!courses) courses = new CourseArray();
        if(!instructors) instructors = new InstructorArray();
        if(!sections) sections = new SectionArray();

        return  { rooms, courses, instructors, sections, settings };
    }

}