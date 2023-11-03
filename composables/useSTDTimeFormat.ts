export const useUseSTDTimeFormat = (date: string | null) : string => {
  if(date === null) return '';

  return useDateFormat(date, 'MMMM D, YYYY').value;
}
