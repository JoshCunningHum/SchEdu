import type { Database } from "~/database.types";
import { Serializer } from "~/types/Serializer";
import { TimetableBuilder, Timetable, type TimeTableModel, type TimetableData } from "~/types/Timetable";

export class TimetableControl{

    static async updateData(id: number, data: TimetableData) : Promise<boolean> {
        const supabase = useSupabaseClient<Database>();

        const { error } = await supabase
            .from('timetables')
            .update({ data: JSON.stringify(data), created: new Date().toISOString()})
            .eq('id', id);
        
        return !error;
    }   

    static generate(timetable: TimeTableModel) : boolean {

        const data = timetable.data;
        if(!data) return false;

        const params = Serializer.extract(data.params)
        console.log(`Unwrapped Parameters: `, params);
        if(!params){
            console.error(`Something wrong when unwrapping the parameters`);
            return false;
        }
        data.sched.generate(params);

        return true;
    }
}