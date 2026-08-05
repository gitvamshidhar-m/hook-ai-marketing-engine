// Lightweight CSV parsing/import for competitor & audience data.
// Handles quoted fields, commas, and newlines inside quotes.

export type CsvRow = string[];

export function parseCSV(text: string): CsvRow[] {
  const rows: CsvRow[] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

// Extract competitor hooks from an uploaded CSV. Heuristic: find a column whose
// name looks like a headline/title/hook, otherwise treat the whole row as one.
export function competitorHooksFromCSV(text: string, limit = 8): string[] {
  const rows = parseCSV(text);
  if (rows.length === 0) return [];

  let start = 0;
  let headerIndex = -1;
  const header = rows[0].map((c) => c.toLowerCase().trim());

  const headlineCol = header.findIndex((c) =>
    /(headline|hook|title|headline|ad.?copy|subject|headline)/.test(c)
  );
  if (headlineCol >= 0) {
    headerIndex = headlineCol;
    start = 1;
  }

  const out: string[] = [];
  for (let i = start; i < rows.length && out.length < limit; i++) {
    const r = rows[i];
    const cell = headerIndex >= 0 ? r[headerIndex] : r.join(" — ");
    const v = (cell || "").trim();
    if (v.length >= 4) out.push(v);
  }
  return out;
}

// Extract audience descriptors. Heuristic: keyword column named audience/persona.
export function audienceFromCSV(text: string): string {
  const rows = parseCSV(text);
  if (rows.length === 0) return "";
  const header = rows[0].map((c) => c.toLowerCase().trim());
  const col = header.findIndex((c) => /(audience|persona|customer|demographic)/.test(c));
  if (col < 0) return "";
  const vals = rows.slice(1, 6).map((r) => (r[col] || "").trim()).filter(Boolean);
  return vals.join(", ").slice(0, 300);
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
