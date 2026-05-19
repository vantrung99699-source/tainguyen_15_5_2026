from pathlib import Path

p = Path(r"e:\tainguyen_17_5_2026\tainguyen_15_5_2026\src\pages\admin\CreateServiceSection.tsx")
text = p.read_text(encoding="utf-8")
start = text.index('          <div className="grid gap-4 sm:grid-cols-2">')
end = text.index('          <div className="grid gap-4 sm:grid-cols-3">', start)

O, C = "<div>", "</div>"
new = f"""          {O} className="max-w-xs">
            <FormFieldLabel required>Giá (đ)</FormFieldLabel>
            <input
              type="number"
              min={{0}}
              value={{price}}
              onChange={{(e) => setPrice(e.target.value)}}
              placeholder="15000"
              className={{inputClass}}
              required
            />
          {C}

          {O}>
            <FormFieldLabelHoverHint
              hint={{`Phần cuối URL trang gian hàng của mặt hàng. Ví dụ: ${{PRODUCT_URL_PREFIX}}ten-mat-hang. Để trống để hệ thống tự tạo slug.`}}
            >
              Liên kết gian hàng (slug)
            </FormFieldLabelHoverHint>
            {O}
              className={{`flex overflow-hidden rounded-lg border bg-white ${{
                slugInvalid
                  ? 'border-red-300 ring-2 ring-red-100'
                  : 'border-zinc-200 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/10'
              }}`}}
            >
              <span className="shrink-0 border-r border-zinc-200 bg-zinc-50 px-2 py-2.5 text-[11px] font-medium text-zinc-500 sm:px-3 sm:text-[12px]">
                {{PRODUCT_URL_PREFIX}}
              </span>
              <input
                value={{slug}}
                onChange={{(e) => setSlug(e.target.value.toLowerCase().replace(/\\s+/g, '-'))}}
                placeholder="Để trống để hệ thống tự tạo"
                className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm font-medium text-zinc-800 outline-none placeholder:text-zinc-400"
              />
            {C}
            {{slugInvalid && (
              <p className="mt-1 text-[12px] font-medium text-red-600">Slug không đúng định dạng.</p>
            )}}
          {C}

"""

p.write_text(text[:start] + new + text[end:], encoding="utf-8")
print("ok")
