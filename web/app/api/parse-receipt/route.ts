import { NextRequest, NextResponse } from 'next/server';
import { insforgeFetch } from '@/lib/insforge';

type ReceiptResult = {
  amount?: number;
  date?: string;
  merchant?: string;
  category?: string;
  raw?: any;
};

export async function POST(req: NextRequest) {
  const { imageUrl } = await req.json();
  if (!imageUrl) {
    return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
  }

  const prompt = `请分析这张票据图片，提取以下信息并以 JSON 返回：
- amount: 金额（数字）
- date: 日期（YYYY-MM-DD 格式）
- merchant: 商家名称
- category: 消费类别（餐饮、交通、购物、娱乐、医疗、教育、住房、其他）
如果无法识别，请留空对应字段。仅返回 JSON。`;

  const response = await insforgeFetch<{ choices: { message: { content: string } }[] }>(
    '/ai/v1/chat/completions',
    {
      method: 'POST',
      body: {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: '你是财务票据解析助手。' },
          { role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: imageUrl } }] },
        ],
      },
    },
    true // service role key
  );

  const content = response.choices?.[0]?.message?.content ?? '{}';
  let parsed: ReceiptResult = {};
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed.raw = content;
  }

  return NextResponse.json({ data: parsed });
}
