import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface PdfColumn {
    header: string;
    key: string;
    width?: number;
}

/**
 * Export data to PDF
 * @param data - Array of row objects
 * @param columns - Column definitions (header + key)
 * @param filename - Output filename (without extension)
 * @param title - Title shown at the top of the PDF
 */
export function exportToPdf(
    data: Record<string, unknown>[],
    columns: PdfColumn[],
    filename: string = "export",
    title: string = "Report",
) {
    const doc = new jsPDF({ orientation: "landscape" });

    // Title
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString("th-TH")}`, 14, 28);

    // Table
    const headers = columns.map((col) => col.header);
    const rows = data.map((row) =>
        columns.map((col) => String(row[col.key] ?? "")),
    );

    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 35,
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [59, 130, 246], // blue-500
            textColor: [255, 255, 255],
            fontStyle: "bold",
        },
        alternateRowStyles: {
            fillColor: [245, 247, 250],
        },
    });

    doc.save(`${filename}.pdf`);
}
