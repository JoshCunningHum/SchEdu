export const useOrdinalize = (n: number) => {
  const end = n % 10;
  const suffix = end === 1 ? 'st'
    : end === 2 ? 'nd'
    : end === 3 ? 'rd'
    : 'th';

  return `${n}${suffix}`;
}
