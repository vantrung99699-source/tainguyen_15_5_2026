from pathlib import Path

p = Path(r"e:\tainguyen_17_5_2026\tainguyen_15_5_2026\src\pages\admin\CreateServiceSection.tsx")
text = p.read_text(encoding="utf-8")
wrong_close = "                            </" + "motion.div" + ">\n"
right_close = "                            </div>\n"
needle = (
    "                                {item.visibility === 'visible' ? 'Hiển thị' : 'Ẩn'}\n"
    "                              </span>\n"
    + wrong_close
    + '                            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">'
)
replacement = needle.replace(wrong_close, right_close, 1)
if needle not in text:
    raise SystemExit("not found")
p.write_text(text.replace(needle, replacement, 1), encoding="utf-8")
print("ok")
