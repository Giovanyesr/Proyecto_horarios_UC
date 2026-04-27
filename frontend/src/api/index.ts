import client from './client'
import type {
  Student, Teacher, Course, Classroom, Enrollment, AvailabilitySlot,
  ScheduleRun, ScheduledSection, PaginatedResponse, CreditSummary, SolverConfig
} from '../types'

// Students
export const studentsApi = {
  list: (params?: object) => client.get<PaginatedResponse<Student>>('/students', { params }).then(r => r.data),
  get: (id: string) => client.get<Student>(`/students/${id}`).then(r => r.data),
  create: (data: Partial<Student>) => client.post<Student>('/students', data).then(r => r.data),
  update: (id: string, data: Partial<Student>) => client.put<Student>(`/students/${id}`, data).then(r => r.data),
  delete: (id: string) => client.delete<Student>(`/students/${id}`).then(r => r.data),
  getAvailability: (id: string) => client.get<AvailabilitySlot[]>(`/students/${id}/availability`).then(r => r.data),
  setAvailability: (id: string, slots: AvailabilitySlot[]) => client.put<AvailabilitySlot[]>(`/students/${id}/availability`, { slots }).then(r => r.data),
  getEnrollments: (id: string) => client.get<Enrollment[]>(`/students/${id}/enrollments`).then(r => r.data),
  setAcademic: (id: string, data: { max_credits: number; academic_status: string; mandatory_course_id?: string | null }) =>
    client.patch<Student>(`/students/${id}/academic`, data).then(r => r.data),
}

// Teachers
export const teachersApi = {
  list: (params?: object) => client.get<PaginatedResponse<Teacher>>('/teachers', { params }).then(r => r.data),
  get: (id: string) => client.get<Teacher>(`/teachers/${id}`).then(r => r.data),
  create: (data: Partial<Teacher>) => client.post<Teacher>('/teachers', data).then(r => r.data),
  update: (id: string, data: Partial<Teacher>) => client.put<Teacher>(`/teachers/${id}`, data).then(r => r.data),
  delete: (id: string) => client.delete<Teacher>(`/teachers/${id}`).then(r => r.data),
  getAvailability: (id: string) => client.get<AvailabilitySlot[]>(`/teachers/${id}/availability`).then(r => r.data),
  setAvailability: (id: string, slots: AvailabilitySlot[]) => client.put<AvailabilitySlot[]>(`/teachers/${id}/availability`, { slots }).then(r => r.data),
}

// Courses
export const coursesApi = {
  list: (params?: object) => client.get<PaginatedResponse<Course>>('/courses', { params }).then(r => r.data),
  get: (id: string) => client.get<Course>(`/courses/${id}`).then(r => r.data),
  create: (data: object) => client.post<Course>('/courses', data).then(r => r.data),
  update: (id: string, data: Partial<Course>) => client.put<Course>(`/courses/${id}`, data).then(r => r.data),
  delete: (id: string) => client.delete<Course>(`/courses/${id}`).then(r => r.data),
  addPrerequisite: (id: string, prereqId: string) => client.post<Course>(`/courses/${id}/prerequisites`, { prerequisite_id: prereqId }).then(r => r.data),
  removePrerequisite: (id: string, prereqId: string) => client.delete<Course>(`/courses/${id}/prerequisites/${prereqId}`).then(r => r.data),
}

// Classrooms
export const classroomsApi = {
  list: (params?: object) => client.get<PaginatedResponse<Classroom>>('/classrooms', { params }).then(r => r.data),
  get: (id: string) => client.get<Classroom>(`/classrooms/${id}`).then(r => r.data),
  create: (data: Partial<Classroom>) => client.post<Classroom>('/classrooms', data).then(r => r.data),
  update: (id: string, data: Partial<Classroom>) => client.put<Classroom>(`/classrooms/${id}`, data).then(r => r.data),
  delete: (id: string) => client.delete<Classroom>(`/classrooms/${id}`).then(r => r.data),
}

// Enrollments
export const enrollmentsApi = {
  list: (params?: object) => client.get<PaginatedResponse<Enrollment>>('/enrollments', { params }).then(r => r.data),
  create: (data: { student_id: string; course_id: string; academic_period: string }) =>
    client.post<Enrollment>('/enrollments', data).then(r => r.data),
  updateStatus: (id: string, status: string) => client.patch<Enrollment>(`/enrollments/${id}/status`, { status }).then(r => r.data),
  delete: (id: string) => client.delete(`/enrollments/${id}`).then(r => r.data),
  creditsSummary: (student_id: string, academic_period: string) =>
    client.get<CreditSummary>('/enrollments/credits-summary', { params: { student_id, academic_period } }).then(r => r.data),
}

// Schedules
export const schedulesApi = {
  generate: (academic_period: string, config: SolverConfig) =>
    client.post<ScheduleRun>('/schedules/generate', { academic_period, config }).then(r => r.data),
  listRuns: (params?: object) => client.get<ScheduleRun[]>('/schedules/runs', { params }).then(r => r.data),
  getRun: (runId: string) => client.get<ScheduleRun>(`/schedules/runs/${runId}`).then(r => r.data),
  getSections: (runId: string, params?: object) =>
    client.get<ScheduledSection[]>(`/schedules/runs/${runId}/sections`, { params }).then(r => r.data),
  getStudentSchedule: (runId: string, studentId: string) =>
    client.get<ScheduledSection[]>(`/schedules/runs/${runId}/student/${studentId}`).then(r => r.data),
  deleteRun: (runId: string) => client.delete(`/schedules/runs/${runId}`).then(r => r.data),
}
