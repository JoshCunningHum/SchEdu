import { defineStore } from 'pinia'
import type { WeekSched } from './teacherStore';

export interface Room{
  name: string;
  capacity: number;
  availability: WeekSched;
}

export const useRoomStoreStore = defineStore('roomStore', () => {
  return {}
})