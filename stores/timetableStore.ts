import { defineStore } from "pinia";
import type { Teacher } from "./teacherStore";
import type { Course } from "./courseStore";
import type { Room } from "./roomStore";
import type { Section } from "./sectionStore";
import type { Class } from "./classStore";
import type { Database } from "~/database.types";


interface TimeTableParams{
    teachers: Teacher[];
    courses: Course[];
    rooms: Room[];
    section: Section[];
    classes: Class[];
}

interface TimeTable{
    id: number;
    created: string;
    by: string;
    name: string;
    data: {sched: string, params: TimeTableParams} | null;
}

export const useTimetableStore = defineStore('timetable', () => {
    const supabase = useSupabaseClient<Database>();
    const session = useSessionStatus();
    const isRequesting = ref(false);

    const data = ref(new Array<TimeTable>());
    const selected = ref<TimeTable | null>(null);
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

        data.value.push(...response.map(t => {
            return <TimeTable>{
                id: t.id,
                created: t.created || '',
                by: t.by || '',
                name: t.name,
                data: t.data ? (JSON.parse(t.data) as TimeTable['data']) : { params: <TimeTableParams>{}, sched: ''}
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

    const remove = async (...ids: TimeTable['id'][]) => {
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

    const setData = async (id: string, data: TimeTable['data']) => {
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