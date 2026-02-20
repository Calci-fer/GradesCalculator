const components = {
  termExams: { weight: 0.30, name: 'Term Exams' },
  recitation: { weight: 0.10, name: 'Recitation / Participation / Attendance' },
  quizzes: { weight: 0.20, name: 'Quizzes' },
  laboratory: { weight: 0.40, name: 'Laboratory / Activities / Project' }
}
const suggestions = {
  termExams: 'Focus on reviewing past exams and mastering key concepts.',
  recitation: 'Increase attendance, participate actively, and prepare before class.',
  quizzes: 'Practice with short quizzes, review mistakes, and pace yourself.',
  laboratory: 'Allocate more time to projects, follow rubrics, and iterate early.'
}
function formatPct(n) {
  if (!isFinite(n)) return '0.00%'
  return `${n.toFixed(2)}%`
}
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}
function gradeEquivalent(pct) {
  const p = clamp(pct, 0, 100)
  if (p >= 96.5) return { grade: '1.00', remark: 'Passed' }
  if (p >= 93.5) return { grade: '1.25', remark: 'Passed' }
  if (p >= 90.5) return { grade: '1.50', remark: 'Passed' }
  if (p >= 87.5) return { grade: '1.75', remark: 'Passed' }
  if (p >= 84.5) return { grade: '2.00', remark: 'Passed' }
  if (p >= 81.5) return { grade: '2.25', remark: 'Passed' }
  if (p >= 78.5) return { grade: '2.50', remark: 'Passed' }
  if (p >= 75.5) return { grade: '2.75', remark: 'Passed' }
  if (p >= 75.0) return { grade: '3.00', remark: 'Passed' }
  return { grade: '5.00', remark: 'Failed' }
}
function createItemRow() {
  const row = document.createElement('div')
  row.className = 'row'
  const scoreWrap = document.createElement('div')
  scoreWrap.className = 'input'
  const scoreLabel = document.createElement('label')
  scoreLabel.textContent = 'Score'
  const scoreInput = document.createElement('input')
  scoreInput.type = 'number'
  scoreInput.min = '0'
  scoreInput.step = '0.01'
  scoreInput.placeholder = '0'
  scoreWrap.append(scoreLabel, scoreInput)
  const totalWrap = document.createElement('div')
  totalWrap.className = 'input'
  const totalLabel = document.createElement('label')
  totalLabel.textContent = 'Total'
  const totalInput = document.createElement('input')
  totalInput.type = 'number'
  totalInput.min = '0'
  totalInput.step = '0.01'
  totalInput.placeholder = '0'
  totalWrap.append(totalLabel, totalInput)
  const removeBtn = document.createElement('button')
  removeBtn.className = 'btn btn-danger'
  removeBtn.type = 'button'
  removeBtn.textContent = 'Remove'
  row.append(scoreWrap, totalWrap, removeBtn)
  function onChange() { recalcAll() }
  scoreInput.addEventListener('input', onChange)
  totalInput.addEventListener('input', onChange)
  removeBtn.addEventListener('click', () => {
    row.parentElement.removeChild(row)
    recalcAll()
  })
  return row
}
function initComponents() {
  const cards = document.querySelectorAll('.component-card')
  cards.forEach(card => {
    const list = card.querySelector('[data-list]')
    const addBtn = card.querySelector('[data-add]')
    list.append(createItemRow())
    addBtn.addEventListener('click', () => {
      list.append(createItemRow())
      recalcAll()
    })
  })
}
function getComponentTotals(card) {
  const rows = Array.from(card.querySelectorAll('.row'))
  let sumScore = 0
  let sumTotal = 0
  rows.forEach(r => {
    const inputs = r.querySelectorAll('input')
    const s = parseFloat(inputs[0].value || '0')
    const t = parseFloat(inputs[1].value || '0')
    if (isFinite(s) && isFinite(t) && t > 0) {
      sumScore += s
      sumTotal += t
    }
  })
  return { sumScore, sumTotal }
}
function recalcAll() {
  const cards = document.querySelectorAll('.component-card')
  let finalPct = 0
  const losses = []
  cards.forEach(card => {
    const key = card.getAttribute('data-key')
    const totals = getComponentTotals(card)
    let percent = 0
    if (totals.sumTotal > 0) percent = (totals.sumScore / totals.sumTotal) * 100
    const weighted = percent * components[key].weight
    finalPct += weighted
    const loss = components[key].weight * (100 - percent)
    if (totals.sumTotal > 0) losses.push({ key, loss })
    const percentEl = card.querySelector('[data-field="percent"]')
    const weightedEl = card.querySelector('[data-field="weighted"]')
    const statusEl = card.querySelector('[data-field="status"]')
    percentEl.textContent = formatPct(percent)
    weightedEl.textContent = weighted.toFixed(2)
    if (statusEl) {
      statusEl.className = 'badge'
      if (percent >= 90) {
        statusEl.textContent = 'Excellent'
        statusEl.classList.add('badge-success')
      } else if (percent >= 75) {
        statusEl.textContent = 'Passing'
        statusEl.classList.add('badge-info')
      } else if (percent >= 60) {
        statusEl.textContent = 'Needs Improvement'
        statusEl.classList.add('badge-warning')
      } else {
        statusEl.textContent = 'At Risk'
        statusEl.classList.add('badge-danger')
      }
    }
  })
  const finalPctEl = document.getElementById('final-percentage')
  finalPctEl.textContent = formatPct(finalPct)
  const eq = gradeEquivalent(finalPct)
  document.getElementById('grade-equivalent').textContent = eq.grade
  const remarkEl = document.getElementById('grade-remark')
  remarkEl.textContent = eq.remark
  remarkEl.className = 'badge'
  if (eq.remark === 'Passed') {
    remarkEl.classList.add('badge-success')
  } else {
    remarkEl.classList.add('badge-danger')
  }
  if (losses.length) {
    losses.sort((a, b) => b.loss - a.loss)
    const top = losses[0]
    document.getElementById('largest-loss').textContent =
      `${components[top.key].name} (${top.loss.toFixed(2)} pts)`
    document.getElementById('suggestion').textContent = suggestions[top.key]
  } else {
    document.getElementById('largest-loss').textContent = '—'
    document.getElementById('suggestion').textContent = '—'
  }
}
function initGPA() {
  const list = document.getElementById('gpa-list')
  function createRow() {
    const row = document.createElement('div')
    row.className = 'gpa-row'
    const unitsWrap = document.createElement('div')
    unitsWrap.className = 'input'
    const unitsLabel = document.createElement('label')
    unitsLabel.textContent = 'Units'
    const unitsInput = document.createElement('input')
    unitsInput.type = 'number'
    unitsInput.min = '0'
    unitsInput.step = '1'
    unitsInput.placeholder = '0'
    unitsWrap.append(unitsLabel, unitsInput)
    const gradeWrap = document.createElement('div')
    gradeWrap.className = 'input'
    const gradeLabel = document.createElement('label')
    gradeLabel.textContent = 'Grade'
    const gradeInput = document.createElement('input')
    gradeInput.type = 'number'
    gradeInput.min = '1'
    gradeInput.step = '0.01'
    gradeInput.placeholder = '1.00'
    gradeWrap.append(gradeLabel, gradeInput)
    const removeBtn = document.createElement('button')
    removeBtn.className = 'btn btn-danger'
    removeBtn.type = 'button'
    removeBtn.textContent = 'Remove'
    row.append(unitsWrap, gradeWrap, removeBtn)
    function onChange() { recalcGPA() }
    unitsInput.addEventListener('input', onChange)
    gradeInput.addEventListener('input', onChange)
    removeBtn.addEventListener('click', () => {
      row.parentElement.removeChild(row)
      recalcGPA()
    })
    return row
  }
  list.append(createRow())
  document.getElementById('add-gpa-row').addEventListener('click', () => {
    list.append(createRow())
    recalcGPA()
  })
}
function recalcGPA() {
  const rows = document.querySelectorAll('.gpa-row')
  let totalUnits = 0
  let weightedSum = 0
  rows.forEach(r => {
    const inputs = r.querySelectorAll('input')
    const units = parseFloat(inputs[0].value || '0')
    const grade = parseFloat(inputs[1].value || '0')
    if (isFinite(units) && isFinite(grade) && units > 0 && grade > 0) {
      totalUnits += units
      weightedSum += units * grade
    }
  })
  const gpaEl = document.getElementById('final-gpa')
  if (totalUnits > 0) {
    gpaEl.textContent = (weightedSum / totalUnits).toFixed(4)
  } else {
    gpaEl.textContent = '0.0000'
  }
}
function ready() {
  initComponents()
  initGPA()
  recalcAll()
  recalcGPA()
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons()
  }
}
document.addEventListener('DOMContentLoaded', ready)
