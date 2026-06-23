import jsPDF from 'jspdf'
import { StudentProfile } from '../types'

export async function generateParentSummaryPDF(
  profile: StudentProfile,
  dreamRows: any[],
  targetRows: any[],
  safeRows: any[]
): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 14

  const header = (title: string) => {
    doc.setFontSize(18)
    doc.setTextColor(30, 41, 59)
    doc.text(title, margin, margin)
    doc.setLineWidth(0.5)
    doc.setDrawColor(37, 99, 235)
    doc.line(margin, margin + 2, pageWidth - margin, margin + 2)
  }

  const sub = (text: string, y: number) => {
    doc.setFontSize(11)
    doc.setTextColor(100, 116, 139)
    doc.text(text, margin, y)
  }

  const badge = (label: string, color: [number, number, number], x: number, y: number) => {
    doc.setFillColor(...color)
    doc.roundedRect(x, y - 3.5, doc.getTextWidth(label) + 4, 6, 1, 1, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.text(label, x + 2, y)
  }

  const y = margin + 10
  header('MHT-CET Admission Roadmap')
  sub(`Student: ${profile.name} | MHT-CET: ${profile.mht_cet_percentile}% | JEE: ${profile.jee_percentile}%`, y)
  sub(`Home University: ${profile.home_university || 'N/A'} | Category: ${profile.category || 'N/A'}`, y + 5)

  const addSection = (label: string, color: [number, number, number], rows: any[], startY: number) => {
    let currentY = startY
    doc.setFontSize(12)
    doc.setTextColor(30, 41, 59)
    doc.text(`${label} (${rows.length})`, margin, currentY)
    currentY += 5
    for (let i = 0; i < Math.min(rows.length, 20); i++) {
      const r = rows[i]
      doc.setFontSize(9)
      doc.setTextColor(60, 60, 60)
      doc.text(`${r.college_name} — ${r.branch_name}`, margin, currentY)
      badge(r.seat_type, color, pageWidth - margin - 30, currentY)
      doc.setTextColor(80, 80, 80)
      doc.text(`Avg: ${r.avgCutoff?.toFixed(2)}%`, pageWidth - margin - 30, currentY)
      currentY += 5
      if (currentY > pageHeight - margin) {
        doc.addPage()
        currentY = margin + 5
      }
    }
    return currentY + 4
  }

  let nextY = y + 18
  nextY = addSection('Tier 1: Dream', [239, 68, 68], dreamRows, nextY)
  nextY = addSection('Tier 2: Target', [245, 158, 11], targetRows, nextY)
  addSection('Tier 3: Safe', [16, 185, 129], safeRows, nextY)

  doc.save(`${profile.name}_Admission_Roadmap.pdf`)
}
