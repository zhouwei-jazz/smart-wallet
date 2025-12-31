type FetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
};

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL;
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
const INSFORGE_SERVICE_ROLE_KEY = process.env.INSFORGE_SERVICE_ROLE_KEY;

function assertEnv(useServiceKey: boolean) {
  if (!INSFORGE_URL || !INSFORGE_ANON_KEY) {
    throw new Error('Missing Insforge env: NEXT_PUBLIC_INSFORGE_URL / NEXT_PUBLIC_INSFORGE_ANON_KEY');
  }
  if (useServiceKey && !INSFORGE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Insforge env: INSFORGE_SERVICE_ROLE_KEY');
  }
}

export async function insforgeFetch<T>(
  path: string,
  opts: FetchOptions = {},
  useServiceKey = false
): Promise<T> {
  assertEnv(useServiceKey);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: useServiceKey ? INSFORGE_SERVICE_ROLE_KEY ?? '' : INSFORGE_ANON_KEY!,
    Authorization: `Bearer ${useServiceKey ? INSFORGE_SERVICE_ROLE_KEY ?? '' : INSFORGE_ANON_KEY!}`,
    ...(opts.headers || {}),
  };
  const res = await fetch(`${INSFORGE_URL}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Insforge request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}
