import jsPDF from "jspdf/dist/jspdf.umd.js";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

export const generatePDFReport = async ({ title, columns, data, logoBase64 }) => {
  try {
    const titleStr = typeof title === 'string' ? title : 'Report';
    const currentDate = dayjs().format("MMMM DD, YYYY");
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const marginLeft = 14;
    const marginRight = pageWidth - 14;
    const marginTop = 20;
    
    let logoLoaded = false;
    let logoRight = marginLeft;
    
    if (logoBase64 && typeof logoBase64 === 'string' && logoBase64.startsWith('data:')) {
      try {
        doc.addImage(logoBase64, 'PNG', marginLeft, marginTop, 25, 25);
        logoLoaded = true;
        logoRight = marginLeft + 25 + 8;

      } catch (logoError) {
        console.warn('Could not add logo to PDF:', logoError);
      }
    }
  
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    const headerY = marginTop + 12;
    doc.text('Sagrada Familia', logoRight, headerY);
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    const titleY = marginTop + 40;
    doc.text(titleStr, marginLeft, titleY);

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
      startY: titleY + 10,
      margin: { left: marginLeft, right: 14 },
      styles: { 
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [24, 144, 255],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    const finalY = doc.lastAutoTable && doc.lastAutoTable.finalY 
      ? doc.lastAutoTable.finalY + 15
      : pageHeight - 25;
    
    const footerY = Math.min(finalY, pageHeight - 15);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    const textWidth = doc.getTextWidth(`Generated on: ${currentDate}`);
    doc.text(`Generated on: ${currentDate}`, (pageWidth - textWidth) / 2, footerY);

    doc.save(`${titleStr.replace(/\s+/g, "_")}.pdf`);

  } catch (error) {
    console.error('Error generating PDF report:', error);
    alert('Failed to generate PDF report. Please check the console for details.');
  }
};

export const generateExcelReport = ({ fileName, data, columns }) => {
  try {
    const fileNameStr = typeof fileName === 'string' ? fileName : 'Report';
    const currentDate = dayjs().format("MMMM DD, YYYY");

    if (!Array.isArray(data)) {
      console.error('Invalid data provided to generateExcelReport');
      return;
    }

    let headers = [];
    let dataArray = [];

    if (columns && Array.isArray(columns) && columns.length > 0) {
      headers = columns.map(col => {
        if (typeof col === 'string') return col;
        return col.title || col.dataIndex || 'Column';
      });

      dataArray = data.map(row => {
        return columns.map(col => {
          if (typeof col === 'string') {
            const value = row[col];

            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            return value;
          }

          const value = row[col.dataIndex];
          if (value === null || value === undefined) return '';

          if (col.render && typeof col.render === 'function') {
            return col.render(value, row);
          }

          if (typeof value === 'object') return JSON.stringify(value);
          return value;
        });
      });
      
    } else {
      headers = data.length > 0 ? Object.keys(data[0]) : [];
      dataArray = data.map(row => {
        return headers.map(key => row[key] ?? '');
      });
    }
    
    const headerData = [
      ['Sagrada Familia', ...Array(headers.length - 1).fill('')],
      ['', ...Array(headers.length - 1).fill('')],
      headers, 
    ];

    const worksheetData = [...headerData, ...dataArray];

    worksheetData.push(['', ...Array(headers.length - 1).fill('')]);
    worksheetData.push([`Generated on: ${currentDate}`, ...Array(headers.length - 1).fill('')]);
    
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
      generateExcelReport({ fileName: title, data, columns });

    } else {
      console.error("Unsupported report type:", type);
      alert(`Unsupported report type: ${type}`);
    }
    
  } catch (error) {
    console.error('Error in generateReport:', error);
    alert('Failed to generate report. Please check the console for details.');
  }
};
