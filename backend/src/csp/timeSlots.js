function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(m) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

function slotOverlaps(s1, s2) {
  if (s1.day_of_week !== s2.day_of_week) return false
  return s1.start_time < s2.end_time && s2.start_time < s1.end_time
}

function generateSlots({ start = '07:00', end = '22:00', durationHours = 2, days = null } = {}) {
  const dayList = days ?? [0, 1, 2, 3, 4, 5]
  const startMin = timeToMinutes(start)
  const endMin   = timeToMinutes(end)
  const durMin   = durationHours * 60
  const slots = []
  for (const day of dayList) {
    let t = startMin
    while (t + durMin <= endMin) {
      slots.push({ day_of_week: day, start_time: minutesToTime(t), end_time: minutesToTime(t + durMin) })
      t += durMin
    }
  }
  return slots
}

module.exports = { generateSlots, slotOverlaps, timeToMinutes, minutesToTime }
