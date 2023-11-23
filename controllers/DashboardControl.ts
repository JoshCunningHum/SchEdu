
export class DashboardControl{
    static async acquireTimeTables(){
        const timetableStore = useTimetableStore();
        await timetableStore.sync();
    }
}