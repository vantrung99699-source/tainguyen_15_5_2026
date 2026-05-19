from pathlib import Path

CLOSE = "</" + "div>"
OPEN = "<" + "motion.div"
OPEN = "<" + "div"
GRID_OPEN = '<div className="grid gap-4 sm:grid-cols-3">'

p = Path(r"e:\tainguyen_17_5_2026\tainguyen_15_5_2026\src\pages\admin\CreateServiceSection.tsx")
text = p.read_text(encoding="utf-8")
start = text.index("              <FormFieldLabel>Slug</FormFieldLabel>") - 12
end = text.index(
    '          <div>\n            <FormFieldLabel>Mô tả ngắn</FormFieldLabel>',
    start,
)

new = f"""            {OPEN}>
              <FormFieldLabel>Liên kết gian hàng (slug)</FormFieldLabel>
              {OPEN}
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
              {CLOSE}
              <p className="mt-1.5 text-[12px] text-zinc-500">
                Đường dẫn trang gian hàng của mặt hàng. Không nhập thì hệ thống tự tạo slug.
              </p>
              {{slugInvalid && (
                <p className="mt-1 text-[12px] font-medium text-red-600">Slug không đúng định dạng.</p>
              )}}
            {CLOSE}
          {CLOSE}

          {GRID_OPEN}
            {OPEN}>
              <FormFieldLabel required>Mua tối thiểu</FormFieldLabel>
              <input
                type="number"
                min={{1}}
                value={{minPurchase}}
                onChange={{(e) => setMinPurchase(e.target.value)}}
                placeholder={{String(DEFAULT_ITEM_MIN_PURCHASE)}}
                className={{inputClass}}
                required
              />
            {CLOSE}
            {OPEN}>
              <FormFieldLabel>Tối đa</FormFieldLabel>
              <input
                type="number"
                min={{1}}
                value={{maxPurchase}}
                onChange={{(e) => setMaxPurchase(e.target.value)}}
                placeholder={{String(DEFAULT_ITEM_MAX_PURCHASE)}}
                className={{inputClass}}
              />
            {CLOSE}
            {OPEN}>
              <FormFieldLabelWithHint
                hint="Chỉ nhập khi mặt hàng đã có lịch sử bán (chuyển shop, nhập tay số cũ). Để trống hoặc 0 nếu mặt hàng mới — hệ thống sẽ đếm từ đơn bán thực tế."
                hintOpen={{soldHintOpen}}
                onToggleHint={{() => setSoldHintOpen((open) => !open)}}
              >
                Số lượng đã bán
              </FormFieldLabelWithHint>
              <input
                type="number"
                min={{0}}
                value={{sold}}
                onChange={{(e) => setSold(e.target.value)}}
                placeholder="0"
                className={{inputClass}}
              />
            {CLOSE}
          {CLOSE}

"""

p.write_text(text[:start] + new + text[end:], encoding="utf-8")
print("patched", len(new))
