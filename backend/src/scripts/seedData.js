require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const Classroom          = require('../models/Classroom')
const Teacher            = require('../models/Teacher')
const TeacherAvailability = require('../models/TeacherAvailability')
const Course             = require('../models/Course')
const Student            = require('../models/Student')
const StudentAvailability = require('../models/StudentAvailability')
const Enrollment         = require('../models/Enrollment')
const User               = require('../models/User')
const AllowedEmail       = require('../models/AllowedEmail')

async function upsert(Model, query, data) {
  let doc = await Model.findOne(query)
  if (!doc) doc = await Model.create(data)
  return doc
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/horarios_uc')
  console.log('[Seed] Connected to MongoDB')

  // ── Classrooms ─────────────────────────────────────────────────────────────
  const classroomsData = [
    { room_code: 'A101', building: 'A', capacity: 40, room_type: 'lecture',      has_projector: true },
    { room_code: 'A102', building: 'A', capacity: 35, room_type: 'lecture',      has_projector: true },
    { room_code: 'A103', building: 'A', capacity: 50, room_type: 'lecture',      has_projector: true },
    { room_code: 'A104', building: 'A', capacity: 60, room_type: 'lecture',      has_projector: true },
    { room_code: 'B201', building: 'B', capacity: 25, room_type: 'lab',          has_projector: true },
    { room_code: 'B202', building: 'B', capacity: 25, room_type: 'computer_lab', has_computers: true },
    { room_code: 'B203', building: 'B', capacity: 30, room_type: 'lab' },
    { room_code: 'B204', building: 'B', capacity: 20, room_type: 'computer_lab', has_computers: true },
    { room_code: 'C301', building: 'C', capacity: 20, room_type: 'seminar',      has_projector: true },
    { room_code: 'C302', building: 'C', capacity: 35, room_type: 'lecture',      has_projector: true },
  ]
  for (const d of classroomsData) await upsert(Classroom, { room_code: d.room_code }, d)
  console.log(`Classrooms : ${await Classroom.countDocuments()}`)

  // ── Teachers ───────────────────────────────────────────────────────────────
  const teachersData = [
    { teacher_code: 'T001', first_name: 'Ana',      last_name: 'García',   email: 'ana.garcia@uc.edu.pe',     department: 'Sistemas',     max_hours_per_week: 20 },
    { teacher_code: 'T002', first_name: 'Carlos',   last_name: 'López',    email: 'carlos.lopez@uc.edu.pe',   department: 'Sistemas',     max_hours_per_week: 18 },
    { teacher_code: 'T003', first_name: 'María',    last_name: 'Torres',   email: 'maria.torres@uc.edu.pe',   department: 'Sistemas',     max_hours_per_week: 20 },
    { teacher_code: 'T004', first_name: 'Juan',     last_name: 'Flores',   email: 'juan.flores@uc.edu.pe',    department: 'Sistemas',     max_hours_per_week: 16 },
    { teacher_code: 'T005', first_name: 'Rosa',     last_name: 'Méndez',   email: 'rosa.mendez@uc.edu.pe',    department: 'Sistemas',     max_hours_per_week: 20 },
    { teacher_code: 'T006', first_name: 'Roberto',  last_name: 'Guzmán',   email: 'roberto.guzman@uc.edu.pe', department: 'Matemáticas',  max_hours_per_week: 20 },
    { teacher_code: 'T007', first_name: 'Patricia', last_name: 'Vega',     email: 'patricia.vega@uc.edu.pe',  department: 'Matemáticas',  max_hours_per_week: 18 },
    { teacher_code: 'T008', first_name: 'Fernando', last_name: 'Castro',   email: 'fernando.castro@uc.edu.pe',department: 'Sistemas',     max_hours_per_week: 16 },
  ]
  const teachers = []
  for (const d of teachersData) teachers.push(await upsert(Teacher, { teacher_code: d.teacher_code }, d))

  for (const teacher of teachers) {
    const existing = await TeacherAvailability.find({ teacher_id: teacher._id })
    const existingDays = new Set(existing.map(a => a.day_of_week))
    for (let day = 0; day < 5; day++) {
      if (!existingDays.has(day)) await TeacherAvailability.create({ teacher_id: teacher._id, day_of_week: day, start_time: '07:00', end_time: '22:00' })
    }
    if (!existingDays.has(5)) await TeacherAvailability.create({ teacher_id: teacher._id, day_of_week: 5, start_time: '07:00', end_time: '14:00' })
  }
  console.log(`Teachers   : ${await Teacher.countDocuments()}`)

  // ── Courses ────────────────────────────────────────────────────────────────
  const coursesData = [
    { course_code: 'SI101', name: 'Fundamentos de Programación',      credits: 4, hours_per_week: 4, semester_level: 1, required_room_type: 'computer_lab', min_students: 5, max_students: 25, department: 'Sistemas' },
    { course_code: 'SI102', name: 'Matemática Discreta',              credits: 4, hours_per_week: 4, semester_level: 1, required_room_type: 'lecture',       min_students: 5, max_students: 40, department: 'Sistemas' },
    { course_code: 'SI103', name: 'Introducción a Sistemas',          credits: 3, hours_per_week: 3, semester_level: 1, required_room_type: 'lecture',       min_students: 5, max_students: 40, department: 'Sistemas' },
    { course_code: 'MA101', name: 'Cálculo Diferencial',              credits: 4, hours_per_week: 4, semester_level: 1, required_room_type: 'lecture',       min_students: 5, max_students: 45, department: 'Matemáticas' },
    { course_code: 'SI201', name: 'Programación Orientada a Objetos', credits: 4, hours_per_week: 4, semester_level: 2, required_room_type: 'computer_lab', min_students: 5, max_students: 25, department: 'Sistemas' },
    { course_code: 'SI202', name: 'Estructura de Datos y Algoritmos', credits: 4, hours_per_week: 4, semester_level: 2, required_room_type: 'computer_lab', min_students: 5, max_students: 25, department: 'Sistemas' },
    { course_code: 'MA102', name: 'Cálculo Integral',                 credits: 4, hours_per_week: 4, semester_level: 2, required_room_type: 'lecture',       min_students: 5, max_students: 45, department: 'Matemáticas' },
    { course_code: 'SI203', name: 'Lógica Computacional',             credits: 3, hours_per_week: 3, semester_level: 2, required_room_type: 'lecture',       min_students: 5, max_students: 35, department: 'Sistemas' },
    { course_code: 'SI301', name: 'Base de Datos I',                  credits: 4, hours_per_week: 4, semester_level: 3, required_room_type: 'computer_lab', min_students: 5, max_students: 25, department: 'Sistemas' },
    { course_code: 'SI302', name: 'Sistemas Operativos',              credits: 4, hours_per_week: 4, semester_level: 3, required_room_type: 'lecture',       min_students: 5, max_students: 35, department: 'Sistemas' },
    { course_code: 'SI303', name: 'Algoritmos y Complejidad',         credits: 4, hours_per_week: 4, semester_level: 3, required_room_type: 'lecture',       min_students: 5, max_students: 35, department: 'Sistemas' },
    { course_code: 'MA103', name: 'Álgebra Lineal',                   credits: 3, hours_per_week: 3, semester_level: 3, required_room_type: 'lecture',       min_students: 5, max_students: 40, department: 'Matemáticas' },
    { course_code: 'SI401', name: 'Ingeniería de Software I',         credits: 4, hours_per_week: 4, semester_level: 4, required_room_type: 'lecture',       min_students: 5, max_students: 35, department: 'Sistemas' },
    { course_code: 'SI402', name: 'Redes de Computadoras',            credits: 3, hours_per_week: 3, semester_level: 4, required_room_type: 'lab',           min_students: 5, max_students: 25, department: 'Sistemas' },
    { course_code: 'SI403', name: 'Base de Datos II',                 credits: 4, hours_per_week: 4, semester_level: 4, required_room_type: 'computer_lab', min_students: 5, max_students: 25, department: 'Sistemas' },
    { course_code: 'SI404', name: 'Arquitectura de Computadoras',     credits: 3, hours_per_week: 3, semester_level: 4, required_room_type: 'lecture',       min_students: 5, max_students: 35, department: 'Sistemas' },
    { course_code: 'SI501', name: 'Inteligencia Artificial',          credits: 4, hours_per_week: 4, semester_level: 5, required_room_type: 'computer_lab', min_students: 5, max_students: 25, department: 'Sistemas' },
    { course_code: 'SI502', name: 'Ingeniería de Software II',        credits: 4, hours_per_week: 4, semester_level: 5, required_room_type: 'lecture',       min_students: 5, max_students: 35, department: 'Sistemas' },
    { course_code: 'SI503', name: 'Seguridad Informática',            credits: 3, hours_per_week: 3, semester_level: 5, required_room_type: 'lecture',       min_students: 5, max_students: 30, department: 'Sistemas' },
    { course_code: 'SI601', name: 'Computación en la Nube',           credits: 3, hours_per_week: 3, semester_level: 6, required_room_type: 'computer_lab', min_students: 5, max_students: 25, department: 'Sistemas' },
    { course_code: 'SI602', name: 'Desarrollo Web Avanzado',          credits: 4, hours_per_week: 4, semester_level: 6, required_room_type: 'computer_lab', min_students: 5, max_students: 25, department: 'Sistemas' },
  ]
  const courses = []
  for (const d of coursesData) courses.push(await upsert(Course, { course_code: d.course_code }, d))

  const courseMap = {}
  for (const c of courses) courseMap[c.course_code] = c

  const prereqPairs = [
    ['SI201','SI101'],['SI202','SI101'],['SI203','SI102'],
    ['MA102','MA101'],
    ['SI301','SI201'],['SI302','SI101'],['SI303','SI202'],
    ['SI401','SI303'],['SI402','SI302'],['SI403','SI301'],
    ['SI501','SI303'],['SI501','SI401'],['SI502','SI401'],
    ['SI503','SI402'],['SI601','SI502'],['SI602','SI501'],
  ]
  for (const [cc, pc] of prereqPairs) {
    const c = courseMap[cc]; const p = courseMap[pc]
    if (c && p && !c.prerequisites.some(id => id.toString() === p._id.toString())) {
      c.prerequisites.push(p._id)
      await c.save()
    }
  }
  console.log(`Courses    : ${await Course.countDocuments()}`)

  // ── Students ───────────────────────────────────────────────────────────────
  const studentsRaw = [
    ['U2024001','Luis','Pérez',1],      ['U2024002','Sofía','Ramírez',1],
    ['U2024003','Diego','Castro',2],    ['U2024004','Valeria','Herrera',2],
    ['U2024005','Andrés','Morales',3],  ['U2024006','Camila','Jiménez',3],
    ['U2024007','Mateo','Vargas',4],    ['U2024008','Isabella','Ortega',4],
    ['U2024009','Santiago','Navarro',5],['U2024010','Valentina','Rojas',5],
    ['U2024011','Miguel','Soto',1],     ['U2024012','Laura','Reyes',2],
    ['U2024013','Daniel','Cruz',3],     ['U2024014','Ana','Molina',4],
    ['U2024015','Pablo','Silva',5],     ['U2024016','Gabriela','Mendoza',1],
    ['U2024017','Ricardo','Vásquez',2], ['U2024018','Daniela','Paredes',3],
    ['U2024019','Sebastián','Fuentes',4],['U2024020','Fernanda','Quispe',5],
    ['U2024021','Alejandro','Cárdenas',1],['U2024022','Natalia','Gutiérrez',2],
    ['U2024023','Joaquín','Espinoza',3],['U2024024','Luciana','Huanca',4],
    ['U2024025','Emilio','Tapia',6],
  ]
  const students = []
  for (const [code, fn, ln, sem] of studentsRaw) {
    const d = { student_code: code, first_name: fn, last_name: ln, email: `${code.toLowerCase()}@uc.edu.pe`, semester: sem, max_credits: 22 }
    students.push(await upsert(Student, { student_code: code }, d))
  }
  for (const student of students) {
    const existing = await StudentAvailability.find({ student_id: student._id })
    const existingDays = new Set(existing.map(a => a.day_of_week))
    for (let day = 0; day < 6; day++) {
      if (!existingDays.has(day)) await StudentAvailability.create({ student_id: student._id, day_of_week: day, start_time: '07:00', end_time: '22:00' })
    }
  }
  console.log(`Students   : ${await Student.countDocuments()}`)

  // ── Enrollments for 2026-1 ─────────────────────────────────────────────────
  const PERIOD = '2026-1'
  const semCourses = {
    1: ['SI101','SI102','SI103','MA101'],
    2: ['SI201','SI202','SI203','MA102'],
    3: ['SI301','SI302','SI303','MA103'],
    4: ['SI401','SI402','SI403','SI404'],
    5: ['SI501','SI502','SI503'],
    6: ['SI601','SI602','SI503'],
  }
  let enrolledCount = 0
  for (const student of students) {
    const bucket = semCourses[student.semester] ?? semCourses[5]
    for (const code of bucket) {
      const course = courseMap[code]
      if (!course) continue
      const exists = await Enrollment.findOne({ student_id: student._id, course_id: course._id, academic_period: PERIOD })
      if (!exists) {
        await Enrollment.create({ student_id: student._id, course_id: course._id, academic_period: PERIOD, status: 'enrolled' })
        enrolledCount++
      }
    }
  }
  const totalEnrollments = await Enrollment.countDocuments({ academic_period: PERIOD })
  console.log(`Enrollments: +${enrolledCount} added for ${PERIOD}`)
  console.log(`             total = ${totalEnrollments} for ${PERIOD}`)

  // ── Admin user ─────────────────────────────────────────────────────────────
  const adminExists = await User.findOne({ username: 'admin' })
  if (!adminExists) {
    const password_hash = await bcrypt.hash('admin123', 12)
    await User.create({ username: 'admin', email: 'admin@uc.edu.pe', password_hash, role: 'admin' })
    console.log('Admin user : created (admin / admin123)')
  } else {
    console.log('Admin user : already exists')
  }

  // ── AllowedEmails for all students ────────────────────────────────────────
  const adminUser = await User.findOne({ username: 'admin' })
  for (const student of students) {
    const emailExists = await AllowedEmail.findOne({ email: student.email })
    if (!emailExists) {
      await AllowedEmail.create({
        email: student.email,
        student_id: student._id,
        added_by_id: adminUser._id,
        is_used: false,
        notes: 'Seeded automatically',
      })
    }
  }
  console.log(`AllowedEmails: ${await AllowedEmail.countDocuments()}`)

  console.log('\n=== Seed complete! ===')
  await mongoose.disconnect()
}

seed().catch(err => {
  console.error('[Seed] Error:', err)
  process.exit(1)
})
