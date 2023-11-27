import { defineStore } from 'pinia'
import { Room, RoomArray, RoomType } from '~/types/Room';
import { TimetableSettings } from '~/types/Timetable';

interface RoomStore{
  rooms: globalThis.ComputedRef<RoomArray | undefined>;

  addRoom(type: RoomType, name: string) : void;
  removeRoom(id: string | Room) : void;
}

export const useRoomStore = defineStore('roomStore', () => {
  
  const timetableStore = useTimetableStore();
  const settings = computed<TimetableSettings | undefined>(() => timetableStore.selected?.data?.params.settings);
  const rooms = computed<RoomArray | undefined>(() => timetableStore.selected?.data?.params.rooms);

  const addRoom = (type: RoomType, name: string) => {
    if(!settings.value) return console.error('Settings is undefined');
    if(rooms.value) rooms.value.create(Room, {type, name, settings: settings.value});
  }

  const removeRoom = (id: string | Room) => {
    if(!settings.value) return console.error('Settings is undefined');
    if(rooms.value) rooms.value.remove(id instanceof Room ? id : (r => r?.id === id));
  }

  return <RoomStore>{
    rooms,
    addRoom,
    removeRoom
  }
})