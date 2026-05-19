import { GoogleGenAI } from '@google/genai';

export interface ProductDescriptionContext {
  name: string;
  shortDescription?: string;
  price?: number;
}

function buildFallbackDescription(context: ProductDescriptionContext): string {
  const priceLine =
    context.price && context.price > 0
      ? `<p><strong>Giá:</strong> ${context.price.toLocaleString('vi-VN')} đ</p>`
      : '';
  const shortLine = context.shortDescription
    ? `<p>${context.shortDescription}</p>`
    : '';
  return `<h3>${context.name}</h3>
${shortLine}
${priceLine}
<ul>
  <li>Sản phẩm chất lượng, giao nhanh sau khi thanh toán.</li>
  <li>Hỗ trợ đổi trả theo chính sách shop.</li>
  <li>Liên hệ admin nếu cần hỗ trợ thêm.</li>
</ul>
<p><em>Mô tả mẫu — cấu hình GEMINI_API_KEY trong .env để dùng AI viết nội dung.</em></p>`;
}

export async function generateProductDescription(
  context: ProductDescriptionContext
): Promise<string> {
  const trimmedName = context.name.trim();
  if (!trimmedName) {
    throw new Error('Vui lòng nhập tên mặt hàng trước khi dùng AI.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return buildFallbackDescription({ ...context, name: trimmedName });
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Bạn là copywriter thương mại điện tử Việt Nam.
Viết mô tả chi tiết HTML cho mặt hàng (chỉ trả về HTML fragment, không markdown, không \`\`\`).
Dùng thẻ: p, h3, ul, li, strong, em. Không dùng script/style.
Tên: ${trimmedName}
${context.shortDescription ? `Mô tả ngắn: ${context.shortDescription}` : ''}
${context.price ? `Giá: ${context.price.toLocaleString('vi-VN')} VND` : ''}
Viết 2-4 đoạn + danh sách lợi ích, giọng chuyên nghiệp, thuyết phục.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error('AI không trả về nội dung. Thử lại.');
  }

  return text.replace(/^```html?\s*/i, '').replace(/```\s*$/i, '').trim();
}
