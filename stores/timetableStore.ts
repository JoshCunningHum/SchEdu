import { defineStore } from "pinia";
import { useDeepToRaw } from "~/composables/useDeepToRaw";
import type { Database } from "~/database.types";
import { Serializer } from "~/types/Serializer";
import { TimetableBuilder, Timetable, type TimetableParams } from "~/types/Timetable";

interface TimeTableOutput extends Timetable{}

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

        // [X]: Make a better serializer to maintain references
        data.value.push(...response.map(t => {
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
                }
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

    const setData = async () : Promise<boolean> => {
        if(!tryRequest()) return false;

        if(!selected.value) return false;

        const id = selected.value.id;
        const data = selected.value.data;

        if(data === null) return false;

        const { error } = await supabase
            .from('timetables')
            .update({ data: JSON.stringify(data), created: new Date().toISOString()})
            .eq('id', id);

        concludeRequest();

        // TODO: Show modal when error on udpating the table
        if(error) return false;

        hasChanges.value = false;
        return true;
    }

    const has = (id: number) => {
        return data.value.findIndex(t => t.id === id) !== -1;
    }

    const change = () => {
        hasChanges.value = true;
    }

    const generate = () => {
        console.log('Attempt to generate...');
        if(!selected.value || !selected.value.data) return;

        // TODO: Add warning for any errors in the input
        const params = Serializer.extract(selected.value.data.params);
        console.log(`Unwrapped Parameters: `, params);
        if(params === null || params === undefined){
            console.error("Something wrong when unwrapping the parameters");
            return;
        }
        selected.value.data.sched.generate(params);
        change();
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
        hasChanges,
        change,
        generate
    }
})