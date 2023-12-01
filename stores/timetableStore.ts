import { defineStore } from "pinia";
import { useDeepToRaw } from "~/composables/useDeepToRaw";
import { DashboardControl } from "~/controllers/DashboardControl";
import { TimetableControl } from "~/controllers/TimetableControl";
import type { Database } from "~/database.types";
import { Serializer } from "~/types/Serializer";
import { TimetableBuilder, Timetable, type TimeTableModel } from "~/types/Timetable";


export const useTimetableStore = defineStore('timetable', () => {
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

        clear();

        // [X]: Make a better serializer to maintain references
        data.value.push(...await DashboardControl.fetchAll());

    }

    const create = async (name: string) => {
        if(!tryRequest()) return;

        const status = await DashboardControl.create(name);

        if(!status) return;

        await sync();

        concludeRequest();
    }

    const remove = async (...ids: TimeTableModel['id'][]) => {
        if(!tryRequest()) return;
        
        const status = await DashboardControl.remove(ids);
        if(!status) return;

        await sync();

        concludeRequest();
    }

    const duplicate = async (id: number) => {
        if(!tryRequest()) return;

        const source = data.value.find(t => t.id === id);

        if(!source) return;

        const status = await DashboardControl.duplicate(source);
        if(!status) return;

        await sync();

        concludeRequest();
    }

    const setData = async () : Promise<boolean> => {
        if(!tryRequest()) return false;

        if(!selected.value) return false;

        const id = selected.value.id;
        const data = selected.value.data;

        if(data === null) return false;

        const status = await TimetableControl.updateData(id, data);

        concludeRequest();

        // TODO: Show modal when error on udpating the table
        if(!status) return false;

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
        if(!selected.value) return;

        TimetableControl.generate(selected.value);

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