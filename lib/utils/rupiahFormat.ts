// lib/rupiahFormat.ts
export const formatRupiah = (value: number | string): string => {
  const str = value.toString().replace(/\D/g, '')
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export const parseRupiah = (formatted: string): number => {
  return parseInt(formatted.replace(/\./g, ''), 10) || 0
}
