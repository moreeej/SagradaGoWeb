import jsPDF from "jspdf/dist/jspdf.umd.js";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

export const generatePDFReport = async ({ title, columns, data, logoBase64 }) => {
  try {
    const titleStr = typeof title === 'string' ? title : 'Report';
    const currentDate = dayjs().format("MMMM DD, YYYY");
    
    const doc = new jsPDF();
    
    let logoLoaded = false;
    let logoRight = 14;
    
    if (logoBase64 && typeof logoBase64 === 'string' && logoBase64.startsWith('data:')) {
      try {
        doc.addImage(logoBase64, 'PNG', 14, 10, 25, 25);
        logoLoaded = true;
        logoRight = 14 + 25 + 5;

      } catch (logoError) {
        console.warn('Could not add logo to PDF:', logoError);
      }
    }

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Sagrada Familia', logoRight, 20);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated on: ${currentDate}`, logoRight, 28);
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(titleStr, 14, 50);

    if (!Array.isArray(columns) || columns.length === 0) {
      console.error('Invalid columns provided to generatePDFReport');
      return;
    }

    if (!Array.isArray(data)) {
      console.error('Invalid data provided to generatePDFReport');
      return;
    }

    autoTable(doc, {
      head: [columns.map(col => {
        if (typeof col === 'string') return col;
        return col.title || col.dataIndex || 'Column';
      })],
      body: data.map(row => columns.map(col => {
        if (typeof col === 'string') {
          return row[col] || '';
        }
        const value = row[col.dataIndex];

        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return value;
      })),
      startY: 50,
      styles: { fontSize: 10 },
    });

    doc.save(`${titleStr.replace(/\s+/g, "_")}.pdf`);

  } catch (error) {
    console.error('Error generating PDF report:', error);
    alert('Failed to generate PDF report. Please check the console for details.');
  }
};

export const generateExcelReport = ({ fileName, data }) => {
  try {
    const fileNameStr = typeof fileName === 'string' ? fileName : 'Report';
    const currentDate = dayjs().format("MMMM DD, YYYY");

    if (!Array.isArray(data)) {
      console.error('Invalid data provided to generateExcelReport');
      return;
    }

    const headers = data.length > 0 ? Object.keys(data[0]) : [];

    const headerData = [
      ['Sagrada Familia', ...Array(headers.length - 1).fill('')],
      [`Generated on: ${currentDate}`, ...Array(headers.length - 1).fill('')],
      ['', ...Array(headers.length - 1).fill('')],
      headers, 
    ];

    const dataArray = data.map(row => {
      return headers.map(key => row[key] ?? '');
    });

    const worksheetData = [...headerData, ...dataArray];
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
    const maxWidth = 30;
    worksheet['!cols'] = headers.map(() => ({ wch: maxWidth }));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${fileNameStr.replace(/\s+/g, "_")}.xlsx`);

  } catch (error) {
    console.error('Error generating Excel report:', error);
    alert('Failed to generate Excel report. Please check the console for details.');
  }
};

export const generateReport = async ({ type = "pdf", title, columns, data, logoBase64 }) => {
  try {
    if (type === "pdf") {
      if (!columns || !Array.isArray(columns)) {
        console.error('Columns are required for PDF reports');
        alert('Cannot generate PDF report: Invalid column configuration.');
        return;
      }
      await generatePDFReport({ title, columns, data, logoBase64 });

    } else if (type === "excel") {
      generateExcelReport({ fileName: title, data });

    } else {
      console.error("Unsupported report type:", type);
      alert(`Unsupported report type: ${type}`);
    }
    
  } catch (error) {
    console.error('Error in generateReport:', error);
    alert('Failed to generate report. Please check the console for details.');
  }
};
