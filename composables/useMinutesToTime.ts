export interface _periodFormat{
  hrs: number;
  mins: number;
  isPM: boolean;
  str: string;
  og: number;
  rhrs: number;
}

export const useMinutesToTime = (minutes: number) : _periodFormat => {
  // Determine if it is AM/PM
  const isPM = minutes >= 720, og = minutes;
  if(isPM) minutes -= 720;
  let hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if(hrs === 0) hrs = 12;

  return {
    og,
    rhrs: hrs + (isPM && hrs !== 12 ? 12 : 0),
    hrs,
    mins,
    isPM,
    str: `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`
  };
}
