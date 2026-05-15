# Styling Documentation - Section Header Component (YOUTUBE)

## Component Overview
React Component: `motion.div` (Framer Motion)
HTML Element: `<div>`

## Tailwind Classes

```html
<div class="flex w-full items-center gap-4 px-6 py-4 rounded-xl shadow-xl shadow-slate-200/40 border border-slate-100 border-l-[6px] border-l-brand-primary mb-6 relative z-10 overflow-hidden group bg-white">
```

## Style Breakdown

### Layout
| Property | Class | Value |
|----------|-------|-------|
| Display | `flex` | Flexbox |
| Width | `w-full` | 100% |
| Align Items | `items-center` | Center vertically |
| Gap | `gap-4` | 16px |

### Spacing
| Property | Class | Value |
|----------|-------|-------|
| Padding X | `px-6` | 24px (6 * 4px) |
| Padding Y | `py-4` | 16px (4 * 4px) |
| Margin Bottom | `mb-6` | 24px (6 * 4px) |

### Border & Radius
| Property | Class | Value |
|----------|-------|-------|
| Border Radius | `rounded-xl` | 12px |
| Border | `border border-slate-100` | 1px solid slate-100 |
| Left Border | `border-l-[6px] border-l-brand-primary` | 6px solid brand-primary |

### Colors
| Property | Class | Value |
|----------|-------|-------|
| Background | `bg-white` | #FFFFFF |
| Border Color | `border-slate-100` | slate-100 |
| Left Border | `border-l-brand-primary` | brand-primary (emerald) |

### Shadow
| Property | Class | Value |
|----------|-------|-------|
| Shadow | `shadow-xl shadow-slate-200/40` | Large shadow with 40% opacity |

### Positioning
| Property | Class | Value |
|----------|-------|-------|
| Position | `relative` | Relative positioning |
| Z-Index | `z-10` | Layer 10 |
| Overflow | `overflow-hidden` | Hide overflow |
| Group | `group` | Enable group hover states |

## CSS Values (Approximate)

```css
display: flex;
width: 100%;
align-items: center;
gap: 16px;
padding: 16px 24px;
margin-bottom: 24px;
border-radius: 12px;
border: 1px solid #f1f5f9;
border-left: 6px solid var(--brand-primary);
background-color: #ffffff;
box-shadow: 0 20px 25px -5px rgba(226, 232, 240, 0.4);
position: relative;
z-index: 10;
overflow: hidden;
```

## Note
- `brand-primary` is a custom theme color (emerald green, default: #10b981)
- `slate-100` = #f1f5f9
- `slate-200/40` = rgba(226, 232, 240, 0.4)
- `group` class enables hover effects on child elements
- `w-full` ensures the header spans full width of container
