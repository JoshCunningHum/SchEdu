import { Activity, ActivityArray } from "./Activity";
import type { Room } from "./Room";
import type { Course } from './Course';
import type { TimetableSettings } from "./Timetable";

export enum Day{
    SUN,
    MON,
    TUE,
    WED,
    THU,
    FRI,
    SAT
}

export class DaySchedArray extends Array<DaySched>{ 
    id: string;

    constructor(...scheds: Array<DaySched[] | DaySched>){
        super();
        this.id = useGenID(8);
        this.push(...scheds.flat());
    }

    add(params : DaySchedParams | DaySched) : DaySched {
        const n = params instanceof DaySched ? params : new DaySched(params);
        this.push(n);
        return n;
    }
    indexOf(sec: DaySched){
        return this.findIndex(s => s.equals(sec));
    }

    remove(sec: DaySched){
        const i = this.indexOf(sec);
        (i !== -1) && this.splice(i, 1);
    }
}

export interface DaySchedParams{
    day?: Day;
    room?: Room;
    start?: number;
    end?:number;
    settings: TimetableSettings
}

export class DaySched{
    static create_week(settings: TimetableSettings, cstart?: number, cend?: number) : DaySchedArray {
        const { start, end, include_sat } = settings;

        const last = include_sat ? Day.SAT : Day.FRI;
        return new DaySchedArray(new Array(last).fill(0).map((v, day) => new DaySched({day: day + 1, start: cstart || start, end: cend || end, settings})));
    }

    day: Day;
    period_start: number;
    period_end: number;
    activities: ActivityArray = new ActivityArray();
    is_vacant: boolean[];
    /** This serves as the TOP of the STACK of classes within the schedule */
    current_vacant: number;

    settings: TimetableSettings;

    get period_duration() : number {
        return this.period_end - this.period_start;
    }

    get number_of_periods(){
        return this.is_vacant.length;
    }

    get index_current_vacant(){
        return (this.current_vacant - this.period_start) / this.settings.interval;
    }

    constructor({ day, start, end, settings} : DaySchedParams ){
        this.day = day || Day.SUN;
        this.period_start = start || 0;
        this.period_end = end || 0;
        this.current_vacant = start || 0;

        const {interval, exlude_periods: exclusions } = settings;

        const NumberOfPeriods = Math.floor(this.period_duration / interval);

        this.is_vacant = new Array(NumberOfPeriods).fill(0).map((v, i) => !exclusions?.includes(interval * i + this.period_start) || false);

        // Set TimeTable Settings reference for later
        this.settings = settings;
    }

    // XXX: Change to validate
    checkConflict(duration: number) : boolean {
        let { index_current_vacant: icv, settings: { interval } } = this;

        for(let i = 0; i < duration / interval; i++){
            if(icv + i >= this.number_of_periods) {
                console.log(`Conflict on Period ${(icv + i) * interval + this.period_start}`);
                return false;
            }
            if(!this.is_vacant[icv + i]){
                icv++;
                i = -1;
            }
        }
        
        return true;
    }

    addActivity(course: Course, duration: number, instance: number){
        let { index_current_vacant: icv, settings: { interval } } = this;

        for(let i = 0; i < duration / interval; i++){
            if(icv + i >= this.number_of_periods) return false;
            if(!this.is_vacant[icv + i]){
                this.current_vacant += interval;
                icv++;
                i = -1;
            }
        }

        const act = this.activities.add({
            start: this.current_vacant,
            duration: duration,
            course: course,
            sched: this,
            instance: instance
        });

        course.course_classes.add(act);

        icv = this.index_current_vacant; // getter
        for(let i = 0; i < duration / interval; i++) this.is_vacant[icv + i] = false;
        this.current_vacant += duration;
        return true;
    }

    addExistingActivity(act : Activity){
        let { period_start, settings: { interval } } = this;

        this.activities.push(act);
        let current_index = (act.start_time - period_start) / interval;
        for(let i = 0; i < act.duration / interval; i++) this.is_vacant[current_index + i] = false;
    }

    checkVacant(start_time: number, duration: number) : boolean {
        let { period_start, settings: { interval } } = this;
        
        let current_index = (start_time - period_start) / interval;
        for(let i = 0; i < duration / interval; i++) if(current_index + i >= this.number_of_periods || !this.is_vacant[current_index + i]) return false; // haha
        return true;
    }

    equals(sched: DaySched) : boolean {
        return this.day === sched.day;
    }

    PrintVacancy(){
        // TODO: Print
    }
}