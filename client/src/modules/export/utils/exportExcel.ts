import * as XLSX from "xlsx";

export interface ExportColumn {
    header: string;
    key: string;
    width?: number;
}

/**
 * Export data to Excel (.xlsx)
 * @param data - Array of row objects
 * @param columns - Column definitions (header + key)
 * @param filename - Output filename (without extension)
 * @param sheetName - Worksheet name
 */
export function exportToExcel(
    data: Record<string, unknown>[],
    columns: ExportColumn[],
    filename: string = "export",
    sheetName: string = "Sheet1",
) {
    // Map data using column definitions
    const rows = data.map((row) =>
        columns.reduce(
            (acc, col) => {
                acc[col.header] = row[col.key] ?? "";
                return acc;
            },
            {} as Record<string, unknown>,
        ),
    );

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Set column widths
    worksheet["!cols"] = columns.map((col) => ({
        wch: col.width || 20,
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    XLSX.writeFile(workbook, `${filename}.xlsx`);
}
