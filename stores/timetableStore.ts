import { defineStore } from "pinia";
import type { Database } from "~/database.types";
import { TimetableBuilder, Timetable, type TimetableParams } from "~/types/Timetable";

interface TimeTableOutput extends Timetable{}

export interface TimeTableModel{
    id: number;
    created: string;
    by: string;
    name: string;
    // HACK: This property is a string inside the database, this is to avoid excessive changes on both the codebase and the database model, once the Timetable Datastructure is finalized, this will be resolve
    data: {
        sched: TimeTableOutput, 
        params: TimetableParams
    } | null;
}

export const useTimetableStore = defineStore('timetable', () => {
    const supabase = useSupabaseClient<Database>();
    const session = useSessionStatus();
    const isRequesting = ref(false);

    const data = ref(new Array<TimeTableModel>());
    
    const selected = ref<TimeTableModel | null>(null);
    const hasChanges = ref(false);

    const select = (id : number) => {
        selected.value = id === null ? null : data.value.find(t => t.id === id) || null;
    }

    // Returns false when there is still a request trying to process
    const tryRequest = () : boolean => {
        if(isRequesting.value) return false;
        isRequesting.value = true;
        return true;
    }

    const concludeRequest = () => isRequesting.value = false;

    const clear = () => data.value.splice(0);

    const sync = async () => {

        const { data: response, error } = await supabase
            .from('timetables')
            .select()
            .eq('by', session.idToken.value);

        if(error) return;

        clear();

        // TODO: Make a better serializer to maintain references
        data.value.push(...response.map(t => {
            return <TimeTableModel>{
                id: t.id,
                created: t.created || '',
                by: t.by || '',
                name: t.name,
                data: t.data ? (JSON.parse(t.data) as TimeTableModel['data']) : { params: TimetableBuilder(), sched: new Timetable()}
            }
        }));

    }

    const create = async (name: string) => {
        if(!tryRequest()) return;

        const { error } = await supabase
            .from('timetables')
            .insert({name: name, by: session.idToken.value});

        if(error) return;

        await sync();

        concludeRequest();
    }

    const remove = async (...ids: TimeTableModel['id'][]) => {
        if(!tryRequest()) return;
        
        const { error } = await supabase
            .from('timetables')
            .delete()
            .in('id', ids);

        if(error) return;

        await sync();

        concludeRequest();
    }

    const duplicate = async (id: number) => {
        if(!tryRequest()) return;

        const source = data.value.find(t => t.id === id);

        if(!source) return;

        const { error } = await supabase
            .from('timetables')
            .insert({name: source.name, by: source.by, data: JSON.stringify(source.data)});

        if(error) return;

        await sync();

        concludeRequest();
    }

    const setData = async (id: string, data: TimeTableModel['data']) => {
        if(!tryRequest()) return;

        const { error } = await supabase
            .from('timetables')
            .update({ data: JSON.stringify(data)})
            .eq('id', id);

        concludeRequest();
    }

    const has = (id: number) => {
        return data.value.findIndex(t => t.id === id) !== -1;
    }

    return {
        data,
        sync,
        create,
        remove,
        has,
        setData,
        selected,
        select,
        duplicate,
        hasChanges
    }
})