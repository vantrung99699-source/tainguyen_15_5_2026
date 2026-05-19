# TapHoaMMO — Phong cách giao diện trang chính (Main UI)

Tài liệu tham chiếu để tái tạo phong cách giao diện của vùng `<main class="pb-32">` trong component `App`, bao gồm banner tuyên bố, lọc danh mục, lưới sản phẩm và footer.

---

## 1. Tổng quan layout

### Cấu trúc DOM

```
div.min-h-screen.bg-[#fcfcfd]
├── Navbar (sticky, z-100)
├── main.pb-32
│   ├── HeroBanner (disclaimer + policy)
│   ├── CategoryFilter (max-w-7xl)
│   └── section (sản phẩm / danh mục)
└── footer
```

### Shell trang

| Phần tử | Class Tailwind | Mục đích |
|---------|----------------|----------|
| Root | `min-h-screen bg-[#fcfcfd]` | Nền xám-trắng nhẹ, full viewport |
| Main | `pb-32` | Padding đáy lớn, tránh footer che nội dung |
| Container nội dung | `max-w-7xl mx-auto px-6` | Giới hạn ~1280px, căn giữa |
| Section sản phẩm | `max-w-7xl mx-auto px-6 mt-20` | Khoảng cách với filter phía trên |

```html
<div class="min-h-screen bg-[#fcfcfd]">
  <main class="pb-32">
    <!-- HeroBanner, CategoryFilter, section -->
  </main>
</div>
```

---

## 2. Design tokens

Định nghĩa trong `src/index.css` (`@theme`):

| Token | Giá trị | Dùng cho |
|-------|---------|----------|
| `--color-brand-primary` | `#53b88d` | CTA, accent, border trái, link |
| `--color-brand-secondary` | `#42a379` | Hover nút primary |
| `--color-brand-accent` | `#f0fdf9` | Nền nhấn emerald nhạt |
| `--font-sans` | Be Vietnam Pro, Inter | Toàn bộ UI |
| Body text | `#1a1c1e` | Chữ mặc định |
| Page background | `#fcfcfd` | Nền trang |

### Màu phụ (Tailwind)

| Vai trò | Class / Hex | Ghi chú |
|---------|-------------|---------|
| Cảnh báo | `orange-400`, `orange-500`, `orange-100` | Disclaimer, accent cảnh báo |
| Chữ phụ | `slate-400`, `slate-500`, `slate-600` | Mô tả, label |
| Chữ tiêu đề | `slate-800`, `gray-900` | Heading |
| Giá / CTA đỏ | `red-600` | Giá sản phẩm |
| Nút tối | `#0F172A` (slate-900) | Zalo, CTA phụ |
| Header top bar | `#2a5b46` | Thanh xanh đậm trên navbar |
| Admin sidebar | `#1e3d2f` | Trang quản trị |

---

## 3. Typography

| Cấp | Class mẫu | Kích thước / đặc điểm |
|-----|-------------|------------------------|
| Tiêu đề banner | `font-bold text-sm uppercase tracking-tight` | 14px, in hoa |
| Nội dung banner | `text-slate-500 text-[13px] leading-relaxed` | 13px, line-height thoáng |
| Tiêu đề danh mục | `text-xl font-black uppercase italic tracking-tighter` | Emerald, italic |
| Label nhỏ | `text-[9px] font-bold uppercase tracking-wider` | Badge, meta |
| Nút / nav | `text-[11px]` – `text-[14px] font-black` | Đậm, dễ đọc |
| Tên sản phẩm | `font-black uppercase text-[13px] tracking-wide` | 2 dòng (`line-clamp-2`) |

**Quy tắc chung:** Ưu tiên `font-black` / `font-bold` cho CTA và tiêu đề; `uppercase` + `tracking-tight` / `tracking-widest` cho nhãn và danh mục.

---

## 4. Banner tuyên bố (Disclaimer) — HeroBanner

Component: `HeroBanner` → khối đầu tiên trong `<main>`.

### 4.1. Tuyên bố miễn trừ trách nhiệm (Cảnh báo)

```html
<div class="bg-gray-50 border border-gray-200 rounded-xl p-6 relative overflow-hidden group">
  <div class="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
  <div class="flex items-start gap-4">
    <div class="bg-orange-100 p-3 rounded-full text-orange-500 shrink-0">
      <!-- Icon AlertCircle w-6 h-6 -->
    </div>
    <div class="space-y-2">
      <h3 class="font-bold text-gray-900 tracking-tight text-sm uppercase">
        TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM ( QUAN TRỌNG )
      </h3>
      <p class="text-slate-500 text-[13px] leading-relaxed">
        Website chỉ cung cấp tài khoản mạng xã hội...
        <span class="text-orange-500 font-semibold mt-1 inline-block">xin chào</span>
      </p>
    </div>
  </div>
</div>
```

| Thuộc tính | Giá trị |
|------------|---------|
| Nền | `bg-gray-50` |
| Viền | `border-gray-200`, `rounded-xl` |
| Accent trái | Thanh dọc `w-1 bg-orange-400` |
| Icon | Vòng tròn `bg-orange-100`, icon `text-orange-500` |
| Animation | `motion`: `opacity 0→1`, `scale 0.98→1` |

### 4.2. Chính sách bảo hành

```html
<div class="bg-white border border-slate-100 rounded-[20px] p-6 relative overflow-hidden shadow-sm">
  <div class="absolute top-0 left-0 w-1 h-full bg-brand-primary/40"></div>
  <!-- Icon emerald-50 + ShieldCheck -->
  <h3 class="font-bold text-slate-800 tracking-tight text-sm uppercase">CHÍNH SÁCH...</h3>
  <p class="text-slate-500 text-[13px] leading-relaxed max-w-2xl">...</p>
  <a class="flex items-center text-brand-primary text-[13px] font-bold hover:underline">...</a>
</div>
```

| Nút | Class |
|-----|-------|
| Primary tối (Zalo) | `bg-[#0F172A] text-white px-5 py-2.5 rounded-[14px] font-bold text-[12px]` |
| Secondary (Telegram) | `bg-white border border-slate-200 text-slate-700 rounded-[14px]` |

**Wrapper HeroBanner:** `max-w-7xl mx-auto px-4 py-8 space-y-4`

---

## 5. Lọc danh mục (CategoryFilter)

```html
<button class="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[11px] font-black tracking-tight border
  /* Active */   bg-brand-primary border-brand-primary text-white shadow-lg shadow-emerald-100
  /* Inactive */ bg-white border-slate-100 text-slate-500 hover:border-brand-primary/30 hover:text-brand-primary
">
```

- Grid: `grid-cols-2 sm:3 md:4 lg:5 xl:6 gap-3`
- Icon danh mục: màu động theo `category.color` khi inactive; trắng khi active
- Animation: `opacity 0→1`, `y: 5→0`, delay theo index

---

## 6. Header khối danh mục (Section header)

Dùng trong `App` khi `activeCategory === 'all'`:

```html
<div class="flex w-full items-center gap-4 px-6 py-4 rounded-xl
  shadow-xl shadow-slate-200/40 border border-slate-100 border-l-[6px] border-l-brand-primary
  mb-6 relative z-10 overflow-hidden group bg-white cursor-pointer
  hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300">
  <div class="p-3 rounded-xl bg-emerald-50 group-hover:scale-110">
    <!-- Icon w-5 h-5 text-brand-primary -->
  </div>
  <div class="flex flex-col">
    <h3 class="text-xl font-black text-brand-primary tracking-tighter uppercase italic leading-none">
      Danh mục <span>...</span>
    </h3>
    <span class="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest
      opacity-0 group-hover:opacity-100 transition-opacity">
      Nhấp để xem tất cả
    </span>
  </div>
  <div class="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-emerald-50 to-transparent pointer-events-none" />
</div>
```

> Chi tiết thêm: xem `style-section-header.md`

---

## 7. Lưới sản phẩm (Product grid)

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
```

### ProductCard — pattern chính

| Vùng | Class |
|------|-------|
| Card | `bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md` |
| Ảnh | `h-44 object-cover group-hover:scale-105 duration-700` |
| Badge danh mục | `bg-brand-primary text-white text-[9px] font-bold uppercase rounded-md` |
| Giá | `text-lg font-black text-red-600` |
| Trạng thái kho | `bg-emerald-50 text-emerald-600` / `bg-slate-50 text-slate-500` |
| Nút Mua | `bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl font-bold text-[12px] shadow-emerald-500/30` |
| Nút Chi tiết | `border border-slate-200 hover:border-brand-primary rounded-xl text-[11px]` |

Animation card: `opacity 0→1`, `y: 20→0`, delay `index * 0.1`

---

## 8. Nút "Xem thêm sản phẩm"

```html
<button class="group relative px-10 py-4 bg-white border-2 border-slate-100
  hover:border-brand-primary/30 rounded-2xl transition-all duration-300
  shadow-sm hover:shadow-xl hover:-translate-y-1">
  <span class="flex items-center gap-3 text-slate-800 font-extrabold text-[14px]">...</span>
  <div class="absolute inset-x-0 bottom-0 h-1.5 bg-brand-primary/5 rounded-full
    scale-x-0 group-hover:scale-x-90 transition-transform origin-center"></div>
</button>
```

---

## 9. Empty state

```html
<div class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
  <div class="bg-gray-50 p-6 rounded-full mb-4"><!-- Icon Sparkles --></div>
  <h3 class="text-lg font-bold text-gray-500">Chưa có sản phẩm...</h3>
  <button class="mt-4 text-brand-primary font-bold hover:underline">Xem tất cả sản phẩm</button>
</div>
```

---

## 10. Footer

```html
<footer class="bg-white border-t border-gray-100 py-16">
  <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
    <!-- Logo tròn brand-primary + TapHoaMMO italic uppercase -->
    <p class="text-[13px] font-bold text-slate-400">© 2026 TapHoaMMO...</p>
    <a class="font-bold text-[13px] text-slate-500 hover:text-brand-primary">...</a>
  </div>
</footer>
```

---

## 11. Navbar (ngữ cảnh main)

| Phần | Class chính |
|------|-------------|
| Top bar | `bg-[#2a5b46]`, chữ `text-[11px] font-bold text-white/60` |
| Header chính | `bg-white h-[70px] sticky top-0 border-b border-slate-100 z-[100]` |
| Logo | Vòng tròn `bg-brand-primary`, chữ `font-black text-[22px]` |
| Search | `bg-slate-50 rounded-full border-slate-200 focus:ring-brand-primary/5` |
| CTA Nạp tiền | `text-orange-500 font-black uppercase` |
| Nút đăng ký | `bg-brand-primary rounded-full shadow-emerald-100` |

---

## 12. Motion & tương tác

| Thư viện | Package |
|----------|---------|
| Animation | `motion/react` (Framer Motion) |

| Pattern | Cấu hình |
|---------|----------|
| Fade in block | `initial={{ opacity: 0 }}` → `animate={{ opacity: 1 }}` |
| Slide up card | `y: 20` → `0`, stagger `delay: index * 0.1` |
| Banner scale | `scale: 0.98` → `1` |
| Hover card | `group-hover:scale-105` (ảnh), `hover:-translate-y-1` (nút) |
| Transition mặc định | `transition-all duration-300` |

---

## 13. Spacing scale (thường dùng)

| Token | px | Class |
|-------|-----|-------|
| xs | 4 | `p-1`, `gap-1` |
| sm | 8–12 | `gap-2`, `py-2` |
| md | 16–24 | `gap-4`, `px-6`, `py-4` |
| lg | 32 | `mt-16`, `mb-12`, `pb-32` |
| xl | 80 | `mb-20`, `mt-20` |

---

## 14. Border radius

| Bo góc | Class | Dùng cho |
|--------|-------|----------|
| Nhỏ | `rounded-lg`, `rounded-xl` | Nút, filter, banner |
| Vừa | `rounded-2xl` | Card sản phẩm, modal |
| Lớn | `rounded-3xl` | Empty state, modal auth |
| Pill | `rounded-full` | Search, avatar, badge |

---

## 15. Checklist tái tạo UI mới

Khi thêm section/component mới vào `<main>`:

- [ ] Nền trang `#fcfcfd`, container `max-w-7xl mx-auto px-6`
- [ ] Card trắng + `border-slate-100` + `shadow-sm` / `shadow-xl shadow-slate-200/40`
- [ ] Accent trái `border-l-[6px]` (orange = cảnh báo, brand-primary = thông tin)
- [ ] Icon trong vòng `p-3 rounded-full` (orange-100 hoặc emerald-50)
- [ ] Chữ mô tả `text-[13px] text-slate-500 leading-relaxed`
- [ ] Tiêu đề `font-bold uppercase text-sm`
- [ ] CTA primary: emerald gradient hoặc `bg-brand-primary`
- [ ] Hover: `transition-all duration-300`, shadow emerald nhẹ
- [ ] Font Be Vietnam Pro, label tiếng Việt

---

## 16. File tham chiếu trong repo

| File | Nội dung |
|------|----------|
| `src/index.css` | Theme tokens |
| `src/App.tsx` | Layout main, section header, grid |
| `src/components/HeroBanner.tsx` | Disclaimer + policy |
| `src/components/CategoryFilter.tsx` | Lọc danh mục |
| `src/components/ProductCard.tsx` | Card sản phẩm |
| `src/components/Navbar.tsx` | Header |
| `style-section-header.md` | Chi tiết header danh mục |
| `style-tiktok-viet.md` | Chi tiết card danh mục clickable |

---

*Cập nhật theo codebase TapHoaMMO — React 19 + Vite + Tailwind CSS v4.*
