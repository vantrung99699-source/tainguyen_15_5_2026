# Styling Documentation - TIKTOK VIỆT Card Component

## Component Overview
React Component: `App` (Standard div)
HTML Element: `<div>`

## Tailwind Classes

```html
<div class="flex items-center gap-4 px-6 py-4 rounded-xl shadow-xl shadow-slate-200/40 border border-slate-100 border-l-[6px] mb-8 relative z-10 overflow-hidden group bg-white cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300">
```

## Style Breakdown

### Layout
| Property | Class | Value |
|----------|-------|-------|
| Display | `flex` | Flexbox |
| Width | N/A | Auto (content-based) |
| Align Items | `items-center` | Center vertical |
| Gap | `gap-4` | 16px |

### Spacing
| Property | Class | Value |
|----------|-------|-------|
| Padding X | `px-6` | 24px (6 * 4px) |
| Padding Y | `py-4` | 16px (4 * 4px) |
| Margin Bottom | `mb-8` | 32px (8 * 4px) |

### Border & Radius
| Property | Class | Value |
|----------|-------|-------|
| Border Radius | `rounded-xl` | 12px |
| Border | `border border-slate-100` | 1px solid slate-100 |
| Left Border | `border-l-[6px]` | 6px solid (category color) |

### Colors
| Property | Class | Value |
|----------|-------|-------|
| Background | `bg-white` | #FFFFFF |
| Border Color | `border-slate-100` | slate-100 |
| Left Border | `border-l-[6px]` | Dynamic (category.color) |
| Text Color | `text-brand-primary` | Brand primary (emerald) |

### Shadow
| Property | Class | Value |
|----------|-------|-------|
| Default Shadow | `shadow-xl shadow-slate-200/40` | Large shadow with 40% opacity |
| Hover Shadow | `hover:shadow-2xl hover:shadow-emerald-500/10` | Emerald tinted hover shadow |

### Positioning
| Property | Class | Value |
|----------|-------|-------|
| Position | `relative` | Relative positioning |
| Z-Index | `z-10` | Layer 10 |
| Overflow | `overflow-hidden` | Hide overflow |
| Group | `group` | Enable group hover states |

### Interactive
| Property | Class | Value |
|----------|-------|-------|
| Cursor | `cursor-pointer` | Pointer cursor on hover |
| Transition | `transition-all duration-300` | 300ms smooth transitions |

## CSS Values (Approximate)

```css
display: flex;
align-items: center;
gap: 16px;
padding: 16px 24px;
margin-bottom: 32px;
border-radius: 12px;
border: 1px solid #f1f5f9;
border-left: 6px solid var(--category-color);
background-color: #ffffff;
box-shadow: 0 20px 25px -5px rgba(226, 232, 240, 0.4);
position: relative;
z-index: 10;
overflow: hidden;
cursor: pointer;
transition: all 0.3s ease;
```

## Hover State CSS

```css
/* On hover */
box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.1);
```

## Note
- `brand-primary` is a custom theme color (emerald green, default: #10b981)
- `slate-100` = #f1f5f9
- `emerald-500/10` = rgba(16, 185, 129, 0.1) (emerald hover shadow)
- Icon background: ${category.color}15 (15% opacity of category color)
- Gradient overlay: ${category.color}08 (8% opacity of category color)
