import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ForecastResult, StudentProfile } from '../types';
import { CATEGORY_LABELS } from './categories';

export function exportToExcel(results: ForecastResult[], filename = 'MHT_CET_2026_Forecast.xlsx') {
  const rows = results.map(r => ({
    'Choice Code': r.choice_code,
    'College Code': r.college_code,
    'College Name': r.college_name,
    'City': r.city,
    'Branch': r.branch,
    'Seat Type': r.seat_type,
    'Forecast 2026': r.forecast,
    'Trend Penalty': r.trendPenalty,
    'Volatility': r.volatility,
    'Tier': r.tier === 1 ? 'Dream' : r.tier === 2 ? 'Realistic' : 'Sure-Shot',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Forecast');
  XLSX.writeFile(wb, filename);
}

export function exportToPDF(results: ForecastResult[], profile: StudentProfile) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.setTextColor(33, 33, 33);
  doc.text('MHT-CET 2026 Expert Counseling Roadmap', pageWidth / 2, 40, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 55, { align: 'center' });

  const infoCard = [
    ['Student Name', profile.name || 'N/A'],
    ['MHT-CET Percentile', `${profile.mhtCetPercentile}%`],
    ['JEE Main Percentile', `${profile.jeePercentile}%`],
    ['Home University', profile.homeUniversity || 'N/A'],
    ['Category', CATEGORY_LABELS[profile.category] || profile.category],
  ];

  (doc as any).autoTable({
    startY: 70,
    body: infoCard,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [245, 245, 245], cellWidth: 140 },
      1: { cellWidth: 200 },
    },
    margin: { left: 40, right: 40 },
  });

  const tableStart = (doc as any).lastAutoTable.finalY + 15;

  const rows = results.map(r => [
    r.choice_code,
    r.college_name,
    r.city,
    r.branch,
    r.seat_type,
    `${r.forecast}%`,
    r.isVolatile ? '⚠️ Volatile' : 'Stable',
    r.tier === 1 ? 'Dream' : r.tier === 2 ? 'Realistic' : 'Sure-Shot',
  ]);

  (doc as any).autoTable({
    startY: tableStart,
    head: [['Choice Code', 'College', 'City', 'Branch', 'Seat Type', 'Forecast', 'Status', 'Tier']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    didParseCell: (data: any) => {
      if (data.section === 'body') {
        const tier = data.row.raw[7];
        if (tier === 'Dream') {
          data.cell.styles.fillColor = [255, 235, 235];
        } else if (tier === 'Realistic') {
          data.cell.styles.fillColor = [255, 248, 225];
        } else if (tier === 'Sure-Shot') {
          data.cell.styles.fillColor = [230, 255, 240];
        }
      }
    },
    margin: { left: 40, right: 40 },
  });

  doc.save('MHT-CET-2026-Counseling-Roadmap.pdf');
}
