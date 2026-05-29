import { formatInTimeZone } from 'date-fns-tz'

export function formatEventDateTime(input: {
  startAt: Date
  endAt?: Date | null
  timezone: string
}) {
  const start = formatInTimeZone(input.startAt, input.timezone, 'EEE, MMM d')
  const startTime = formatInTimeZone(input.startAt, input.timezone, 'h:mm a')
  const tz = input.timezone

  if (!input.endAt) {
    return `${start} · ${startTime} (${tz})`
  }

  const endTime = formatInTimeZone(input.endAt, input.timezone, 'h:mm a')
  const sameDay =
    formatInTimeZone(input.startAt, input.timezone, 'yyyy-MM-dd') ===
    formatInTimeZone(input.endAt, input.timezone, 'yyyy-MM-dd')

  if (sameDay) return `${start} · ${startTime}–${endTime} (${tz})`
  const end = formatInTimeZone(input.endAt, input.timezone, 'EEE, MMM d')
  return `${start} ${startTime} → ${end} ${endTime} (${tz})`
}
