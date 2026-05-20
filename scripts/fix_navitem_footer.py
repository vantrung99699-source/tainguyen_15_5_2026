from pathlib import Path

path = Path(__file__).resolve().parents[1] / "src/components/Navbar.tsx"
lines = path.read_text(encoding="utf-8").splitlines()
d = "div"
new_block = [
    "            {!hideFooter && (",
    f'              <{d} className="mt-2 border-t border-slate-50 pt-2">',
    "                <a",
    '                  href="#"',
    '                  className="flex items-center justify-center py-2 text-[11px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-brand-primary"',
    "                >",
    "                  Xem tất cả",
    "                </a>",
    f"              </{d}>",
    "            )}",
    f"            </{d}>",
]

lines = lines[:643] + new_block + lines[648:]
path.write_text("\n".join(lines) + "\n", encoding="utf-8")
print("fixed")
