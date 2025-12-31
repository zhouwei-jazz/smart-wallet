import { NextRequest, NextResponse } from 'next/server';

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL;
const INSFORGE_SERVICE_ROLE_KEY = process.env.INSFORGE_SERVICE_ROLE_KEY;
const BUCKET = process.env.NEXT_PUBLIC_INSFORGE_BUCKET || 'uploads';

function assertEnv() {
  if (!INSFORGE_URL) {
    throw new Error('Missing env: NEXT_PUBLIC_INSFORGE_URL');
  }
  if (!INSFORGE_SERVICE_ROLE_KEY) {
    throw new Error('Missing env: INSFORGE_SERVICE_ROLE_KEY');
  }
}

export async function POST(req: NextRequest) {
  try {
    assertEnv();
    const serviceKey = INSFORGE_SERVICE_ROLE_KEY as string;
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    const key = `receipts/${Date.now()}-${file.name}`;
    const uploadUrl = `${INSFORGE_URL}/api/storage/buckets/${encodeURIComponent(BUCKET)}/objects/${encodeURIComponent(
      key
    )}`;

    const upstream = new FormData();
    upstream.append('file', file, file.name);

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: upstream,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ error: json.error || 'Upload failed' }, { status: res.status });
    }

    const publicUrl =
      json.url ||
      `${INSFORGE_URL}/api/storage/buckets/${encodeURIComponent(BUCKET)}/objects/${encodeURIComponent(key)}`;

    return NextResponse.json({ data: { key, url: publicUrl } });
  } catch (error: any) {
    console.error('upload error', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
