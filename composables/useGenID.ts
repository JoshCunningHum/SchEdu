export const useGenID = (length: number) : string => {
  return Math.random().toString(36).slice(2, 2 + length);
}
