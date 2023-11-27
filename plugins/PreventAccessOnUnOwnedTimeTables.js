// Handles un authorized access on timetables that is not owned

import { useTimetableStore } from "~/stores/timetableStore";
import { RoomArray } from "~/types/Room";

export default defineNuxtPlugin(nuxt => {
    const nuxtApp = useNuxtApp();
    const timetableStore = useTimetableStore(nuxtApp.$pinia);

    window.RoomArray = RoomArray;

    // The route middle ware
    addRouteMiddleware('prevent-access-on-unowned-timetables', async (to, from) => {
        // Get params
        try {
            await timetableStore.sync();
            const id = parseInt(to.params.id);
            if(timetableStore.has(id)) return; // Safe
            return navigateTo('/dashboard'); // Acccessed on un accessible timetable
        }catch{
            // Any errors encountered shall be redirected to dashboard
            return navigateTo('/dashboard');
        }
    })
})