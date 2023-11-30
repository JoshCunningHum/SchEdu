import type { Database } from "~/database.types";
import { Serializer } from "~/types/Serializer";
import { TimetableBuilder, Timetable, type TimeTableModel, type TimetableData } from "~/types/Timetable";

export class TimetableControl{
    static async fetchAll() : Promise<TimeTableModel[]> {
        const supabase = useSupabaseClient<Database>();
        const session = useSessionStatus();

        // Basis on the current session data to acquire base on the current logined user
        const { data, error } = await supabase
            .from('timetables')
            .select()
            .eq('by', session.idToken.value);

        
        return data?.map(t => {
            const dataParsed = t.data ? 
            (JSON.parse(t.data) as TimeTableModel['data']) ||  { params: TimetableBuilder(), sched: new Timetable()} : 
            { params: TimetableBuilder(), sched: new Timetable()};
            
            const sched = Serializer.fix(dataParsed.sched) || new Timetable();
            const params = Serializer.extract(dataParsed.params) || TimetableBuilder();

            return <TimeTableModel>{
                id: t.id,
                created: t.created || '',
                by: t.by || '',
                name: t.name,
                data: {
                    sched,
                    params
              ,  }
            }
        }) || [];
    }

    static async create(name: string) : Promise<boolean> {
        const supabase = useSupabaseClient<Database>();
        const session = useSessionStatus();

        const { error } = await supabase
            .from('timetables')
            .insert({name: name, by: session.idToken.value});

        return !error;
    }

    static async remove(ids: number[]) : Promise<boolean> {
        const supabase = useSupabaseClient<Database>();

        const { error } = await supabase
            .from('timetables')
            .delete()
            .in('id', ids);

        return !error;
    }

    static async duplicate(source: TimeTableModel) : Promise<boolean> {
        const supabase = useSupabaseClient<Database>();

        const { name, by, data } = source;
        
        const { error } = await supabase
            .from('timetables')
            .insert({name: name, by: by, data: JSON.stringify(data)});

        return !error;
    }

    static async updateData(id: number, data: TimetableData) : Promise<boolean> {
        const supabase = useSupabaseClient<Database>();

        const { error } = await supabase
            .from('timetables')
            .update({ data: JSON.stringify(data), created: new Date().toISOString()})
            .eq('id', id);
        
        return !error;
    }   
}