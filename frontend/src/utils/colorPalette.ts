/** Deterministic color per course code (HSL, WCAG AA compliant on white) */
export function getCourseColor(code: string): { bg: string; text: string; border: string } {
  let hash = 0
  for (let i = 0; i < code.length; i++) {
    hash = (hash << 5) - hash + code.charCodeAt(i)
    hash |= 0
  }
  const hue = Math.abs(hash) % 360
  return {
    bg: `hsl(${hue}, 65%, 90%)`,
    text: `hsl(${hue}, 65%, 25%)`,
    border: `hsl(${hue}, 65%, 70%)`,
  }
}

export const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
export const DAY_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
