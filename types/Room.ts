import { useGenID } from "~/composables/useGenID";
import { DaySchedArray, DaySched, Day } from "./DaySched";
import type { TimetableSettings } from "./Timetable";

export class RoomTypeArray extends Array<RoomType>{

    constructor(...rooms: Array<RoomType | string>){
        super();
        this.add(...rooms);
    }

    // Will create the RoomType if not found, haha sounds very dangerous tho
    of(name: string) : RoomType {
        const i = this.index(name);
        return i === -1 ? this.add(name)[this.length] : this[i];
    }

    add(...rooms : Array<RoomType | string>) : RoomTypeArray {
        rooms.forEach(room => this.push(typeof room === 'string' ? new RoomType(room) : room));
        return this;
    }

    has(room: RoomType | string) : boolean {
        return this.index(room) !== -1;
    }

    index(room: RoomType | string) : number {
        return this.findIndex(t => typeof room === 'string' ? t.name === room : t.equals(room));
    }

    remove(room: RoomType | string){
        const i = this.index(room);
        (i > -1) && this.splice(i, 1);
    }
}

export class RoomType{
    id: string;
    name: string;

    // TODO: Add a color property or any property for easier discrimination
    constructor(name: string){
        this.name = name;
        this.id = useGenID(8);
    }

    equals = (other : RoomType) : boolean => other.id == this.id;
}

export class RoomArray extends Array<Room>{
    
    constructor(...scheds: Array<Room[] | Room>){
        super();
        this.push(...scheds.flat());
    }

    add(params : RoomParams | Room) : Room {
        const n = params instanceof Room ? params : new Room(params);
        this.push(n);
        return n;
    }
    
    indexOf(sec: Room){
        return this.findIndex(s => s.equals(sec));
    }

    remove(sec: Room){
        const i = this.indexOf(sec);
        (i !== -1) && this.splice(i, 1);
    }
}

export interface RoomParams{
    type: RoomType;
    settings: TimetableSettings;

    id?: string;
}

export class Room{

    // Define a proper room type
    id: string;
    // SUGGEST: But what if a room can be both a lecture and a lab?
    type: RoomType; 
    scheds: DaySchedArray;

    constructor({ type, settings, id } : RoomParams){
        this.id = id || useGenID(8);
        this.type = type;
        this.scheds = DaySched.create_week(settings);
    }

    equals(room: Room) : boolean {
        return this.id === this.id;
    }
}