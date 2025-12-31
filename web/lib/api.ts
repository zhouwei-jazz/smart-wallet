export type Transaction = {
  id: string;
  merchant: string;
  amount: number;
  tag: string;
  time: string;
  date?: string;
  account?: string;
};

export type Account = {
  id: string;
  name: string;
  balance: number;
  type: string;
  currency?: string;
};

type ApiResponse<T> = { data: T };

const apiFetch = async <T>(path: string): Promise<T> => {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  const json = (await res.json()) as ApiResponse<T>;
  return json.data;
};

export async function getTransactions(): Promise<Transaction[]> {
  return apiFetch<Transaction[]>('/api/transactions');
}

export async function getAccounts(): Promise<Account[]> {
  return apiFetch<Account[]>('/api/accounts');
}
