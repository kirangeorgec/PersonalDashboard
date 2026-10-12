// Google Sheets sync via Google Sheets API v4
// Requires a Google Cloud project with Sheets API enabled and an API key or OAuth token.
// Set EXPO_PUBLIC_SHEETS_ID and EXPO_PUBLIC_GOOGLE_API_KEY in your .env file.

const SHEETS_ID = process.env.EXPO_PUBLIC_SHEETS_ID ?? '';
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY ?? '';

export type SheetName = 'Projects' | 'Actions' | 'Planner' | 'Learnings';

async function readSheet(sheet: SheetName): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/${sheet}?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheets read failed: ${res.status}`);
  const data = await res.json();
  return data.values ?? [];
}

async function writeSheet(sheet: SheetName, rows: string[][], accessToken: string): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/${sheet}?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ range: sheet, majorDimension: 'ROWS', values: rows }),
  });
  if (!res.ok) throw new Error(`Sheets write failed: ${res.status}`);
}

export { readSheet, writeSheet };
