export function add30Days(unixTimestamp: number): Date {
  const startDate = new Date(unixTimestamp * 1000) // converte UNIX para Date
  startDate.setDate(startDate.getDate() + 30)      // adiciona 30 dias
  return startDate
}