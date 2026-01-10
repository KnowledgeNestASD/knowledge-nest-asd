import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  title: string;
  subtitle?: string;
  generatedBy?: string;
  data: Array<Record<string, any>>;
  columns: Array<{ header: string; key: string }>;
}

export function generatePDF(report: ReportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(0, 102, 204); // Primary blue
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Knowledge Nest', 14, 15);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Ambassador School Dubai Library', 14, 23);
  
  // Report Title
  doc.setTextColor(34, 34, 34);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(report.title, 14, 50);
  
  if (report.subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(report.subtitle, 14, 58);
  }
  
  // Generated info
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  const dateStr = `Generated: ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
  doc.text(dateStr, pageWidth - 14 - doc.getTextWidth(dateStr), 50);
  
  if (report.generatedBy) {
    doc.text(`By: ${report.generatedBy}`, pageWidth - 14 - doc.getTextWidth(`By: ${report.generatedBy}`), 58);
  }
  
  // Table
  const tableData = report.data.map((row) =>
    report.columns.map((col) => String(row[col.key] ?? ''))
  );
  
  autoTable(doc, {
    startY: 70,
    head: [report.columns.map((col) => col.header)],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [0, 102, 204],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [34, 34, 34],
    },
    alternateRowStyles: {
      fillColor: [249, 245, 238], // Warm beige from design
    },
    margin: { left: 14, right: 14 },
    styles: {
      cellPadding: 4,
      overflow: 'linebreak',
    },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'Knowledge Nest - Ambassador School Dubai',
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }
  
  // Save
  const filename = `${report.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

export function generateCSV(data: Array<Record<string, any>>, columns: Array<{ header: string; key: string }>, filename: string): void {
  const headers = columns.map((col) => col.header).join(',');
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = String(row[col.key] ?? '');
      // Escape quotes and wrap in quotes if contains comma
      if (value.includes(',') || value.includes('"')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}
