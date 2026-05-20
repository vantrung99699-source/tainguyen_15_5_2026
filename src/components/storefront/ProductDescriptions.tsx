import type { Product } from '../../types';

interface ProductDescriptionsProps {
  product: Product;
}

export function ProductDescriptions({ product }: ProductDescriptionsProps) {
  const shortText = product.shortDescription?.trim() || product.description?.trim();
  const detailHtml = product.detailDescription?.trim();

  if (!shortText && !detailHtml) return null;

  return (
    <div className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3">
      {shortText ? (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Mô tả ngắn</p>
          <p className="mt-1 text-[13px] font-medium leading-relaxed text-zinc-700">{shortText}</p>
        </div>
      ) : null}
      {detailHtml ? (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Mô tả chi tiết</p>
          <div
            className="prose prose-sm mt-1 max-h-40 max-w-none overflow-y-auto text-zinc-700 [&_img]:max-h-28 [&_img]:rounded-lg [&_p]:my-1"
            dangerouslySetInnerHTML={{ __html: detailHtml }}
          />
        </div>
      ) : null}
    </div>
  );
}
