export interface Student {
  id: string
  student_code: string
  first_name: string
  last_name: string
  email: string
  semester: number
  is_active: boolean
  max_credits: number
  academic_status: 'active' | 'probation' | 'resting'
  mandatory_course_id: string | null
  created_at: string
  updated_at: string
}

export interface Teacher {
  id: string
  teacher_code: string
  first_name: string
  last_name: string
  email: string
  department: string
  max_hours_per_week: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  course_code: string
  name: string
  credits: number
  hours_per_week: number
  semester_level: number
  required_room_type: string
  min_students: number
  max_students: number
  department: string
  is_active: boolean
  prerequisites: Course[]
}

export interface Classroom {
  id: string
  room_code: string
  building: string
  capacity: number
  room_type: string
  has_projector: boolean
  has_computers: boolean
  is_active: boolean
}

export interface AvailabilitySlot {
  id?: string
  day_of_week: number
  start_time: string
  end_time: string
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  academic_period: string
  status: string
  enrolled_at: string
  course?: Course
}

export interface CreditSummary {
  student_id: string
  academic_period: string
  total_credits: number
  courses: Course[]
  within_limit: boolean
}

export interface ScheduleRun {
  id: string
  academic_period: string
  status: string
  solver_config: string
  nodes_explored: number | null
  duration_ms: number | null
  error_message: string | null
  created_at: string
}

export interface ScheduledSection {
  id: string
  run_id: string
  course_id: string
  teacher_id: string
  classroom_id: string
  day_of_week: number
  start_time: string
  end_time: string
  section_number: number
  course?: Course
  teacher?: Teacher
  classroom?: Classroom
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface SolverConfig {
  use_mrv: boolean
  use_lcv: boolean
  use_ac3: boolean
  use_forward_checking: boolean
  timeout_seconds: number
  slot_duration_hours: number
}
