export type WeddingAccount = {
  username: string;
  password: string;
  spreadsheetId: string;
};

export function getWeddingAccounts(): WeddingAccount[] {
  const accounts: WeddingAccount[] = [];

  for (let index = 1; index <= 50; index += 1) {
    const suffix = index === 1 ? "" : `_${index}`;
    const username = process.env[`ADMIN_USERNAME${suffix}`]?.trim();
    const password = process.env[`ADMIN_PASSWORD${suffix}`]?.trim();
    const spreadsheetId = process.env[`GOOGLE_SHEETS_SPREADSHEET_ID${suffix}`]?.trim();

    if (!username && !password && !spreadsheetId) continue;
    if (!username || !password || !spreadsheetId) {
      throw new Error(`Incomplete wedding account configuration for account ${index}.`);
    }

    accounts.push({ username, password, spreadsheetId });
  }

  return accounts;
}

export function authenticateWeddingAccount(username: string, password: string): WeddingAccount | null {
  return getWeddingAccounts().find((account) => account.username === username && account.password === password) ?? null;
}

export function getWeddingAccountByUsername(username: string): WeddingAccount | null {
  return getWeddingAccounts().find((account) => account.username === username) ?? null;
}

export function getWeddingSpreadsheetIds(): string[] {
  return [...new Set(getWeddingAccounts().map((account) => account.spreadsheetId))];
}
