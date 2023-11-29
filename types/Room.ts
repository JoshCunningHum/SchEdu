import { useGenID } from "~/composables/useGenID";
import { DaySchedArray, DaySched, Day } from "./DaySched";
import type { TimetableSettings } from "./Timetable";
import { ExtE, ExtArray } from "./ExtendedArray";

export class RoomTypeArray extends ExtArray<RoomType, RoomTypeParams>{

    constructor(...rooms: Array<RoomType | string>){
        super(rooms.map(r => r instanceof RoomType ? r : new RoomType({name: r})));
    }

    from(...args : [string, string][]) : RoomTypeArray {
        this.push(...args.map(([name, color]) => new RoomType({name, color})));
        return this;
    }
}

export interface RoomTypeParams{
    name: string;
    color?: string;
}

export class RoomType extends ExtE<RoomType>{
    id: string;
    name: string;
    color: string;

    constructor({name, color} : RoomTypeParams){
        super();
        this.name = name;
        this.color = color || '#555555';
        this.id = useGenID(8);
    }

    equals(other : RoomType) : boolean {
        return other.id === this.id
    }
}

export class RoomArray extends ExtArray<Room, RoomParams>{
    constructor(...scheds: Array<Room[] | Room>){
        super(...scheds);
    }
}
export interface RoomParams{
    type: RoomType;
    settings: TimetableSettings;
    name: string;
}

export class Room extends ExtE<Room>{

    // Define a proper room type
    id: string;
    name: string;
    // SUGGEST: But what if a room can be both a lecture and a lab?
    // Answer: Just set the course to allow those types. If ever a room is a back up room, and 2 courses with no joint room types can use that, create a backup/general room type and add it on those course
    type: RoomType; 
    scheds: DaySchedArray;

    constructor({ type, settings, name } : RoomParams){
        super();
        this.id = useGenID(8);
        this.name = name;
        this.type = type;
        this.scheds = DaySched.create_week(settings);
    }

    equals(room: Room) : boolean {
        return this.id === room.id;
    }
}