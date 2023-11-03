import { defineStore } from "pinia"

class TimeTableParams{
    /**@type {import("./teacherStore").Teacher[]";} */
    teachers = [];
    /**@type {import("./courseStore").Course[]} */
    courses = [];
    /**@type {import("./roomStore").Room[]} */
    rooms = [];
    /**@type {import("./sectionStore").Section[]} */
    sections = [];
    /**@type {import("./classStore").Class[]} */
    classes = [];
}

class TimeTable{
    /**@type {Number} */
    id;
    /**@type {String} */
    created;
    /**@type {String} */
    by;
    /**@type {String} */
    name;
    /**
     * Contains two components, sched (Schedule) and params (Parameters)
     * @type {{sched: string, params: TimeTableParams} | null} 
     */
    data;
}

export const useTimetableStore = defineStore('timetable', () => {
    const supabase = useSupabaseClient();
    const session = useSessionStatus();
    const isRequesting = ref(false);

    /**@type {Ref<TimeTable[]>} */
    const data = ref([]);
    /**@type {Ref<TimeTable | null>} */
    const selected = ref(null);

    const hasChanges = ref(false);

    const select = id => {
        selected.value = id === null ? null : data.value.find(t => t.id === id);
    }

    const sync = async () => {
        // Sync with supabaseDB to acquire timetables

        /**@type {{data: TimeTable[]}} */
        const { data: response, error } = await supabase
            .from('timetables')
            .select()
            .eq('by', session.idToken.value);

        if(error) return;

        clear();
        data.value.push(...response.map(t => {
            return {
                id: t.id,
                created: t.created,
                by: t.by,
                name: t.name,
                data: t.data ? JSON.parse(t.data) : {params: new TimeTableParams(), sched: ""}
            }
        }));
    }

    const clear = () => data.value.splice(0);

    const create = async name => {
        if(isRequesting.value) return; // Cancel concurrent requests
        isRequesting.value = true;

        // Send a supabase insert request then sync
        const { error } = await supabase
            .from('timetables')
            .insert({name: name, by: session.idToken.value});

        if(error) return;

        await sync();

        isRequesting.value = false;
    }

    const remove = async (...ids) => {
        if(isRequesting.value) return; // Cancel concurrent requests
        isRequesting.value = true;

        // Sends a delete request then syncs
        const { error } = await supabase
            .from('timetables')
            .delete()
            .in('id', ids);

        if(error) return;

        await sync();

        isRequesting.value = false;
    }

    const duplicate = async id => {
        if(isRequesting.value) return; // Cancel concurrent requests
        isRequesting.value = true;

        // Find the timetable data with the id
        const source = data.value.find(t => t.id === id);

        const { error } = await supabase
            .from('timetables')
            .insert({name: source.name, by: source.by, data: source.data});

        if(error) return;

        await sync();

        isRequesting.value = false;
    }

    const setData = async (id, data) => {
        if(isRequesting.value) return;
        isRequesting.value = true;

        // Send an update request
        const { error } = await supabase
            .from('timetables')
            .update({ data: JSON.stringify(data) })
            .eq('id', id);

        isRequesting.value = false;
    }

    const has = id => {
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
});