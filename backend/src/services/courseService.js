const Course = require('../models/Course')

async function hasCircularPrerequisite(courseId, newPrereqId) {
  const visited = new Set()

  async function dfs(nodeId) {
    if (nodeId.toString() === courseId.toString()) return true
    if (visited.has(nodeId.toString())) return false
    visited.add(nodeId.toString())
    const node = await Course.findById(nodeId)
    if (!node) return false
    for (const prereqId of node.prerequisites) {
      if (await dfs(prereqId)) return true
    }
    return false
  }

  return dfs(newPrereqId)
}

async function addPrerequisite(courseId, prereqId) {
  const course = await Course.findById(courseId).populate('prerequisites')
  if (!course) { const e = new Error('Course not found'); e.status = 404; throw e }
  if (courseId.toString() === prereqId.toString()) {
    const e = new Error('A course cannot be its own prerequisite'); e.status = 400; throw e
  }
  const prereq = await Course.findById(prereqId)
  if (!prereq) { const e = new Error('Prerequisite course not found'); e.status = 404; throw e }

  if (course.prerequisites.some(p => p._id.toString() === prereqId.toString())) {
    const e = new Error('Already a prerequisite'); e.status = 409; throw e
  }
  if (await hasCircularPrerequisite(courseId, prereqId)) {
    const e = new Error('Adding this prerequisite would create a circular dependency'); e.status = 400; throw e
  }
  course.prerequisites.push(prereq._id)
  await course.save()
  return Course.findById(courseId).populate('prerequisites')
}

async function removePrerequisite(courseId, prereqId) {
  const course = await Course.findById(courseId).populate('prerequisites')
  if (!course) { const e = new Error('Course not found'); e.status = 404; throw e }

  const idx = course.prerequisites.findIndex(p => p._id.toString() === prereqId.toString())
  if (idx === -1) {
    const e = new Error('Prerequisite not found for this course'); e.status = 404; throw e
  }
  course.prerequisites.splice(idx, 1)
  await course.save()
  return Course.findById(courseId).populate('prerequisites')
}

module.exports = { addPrerequisite, removePrerequisite }
