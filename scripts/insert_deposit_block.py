from pathlib import Path

root = Path(__file__).resolve().parents[1]
snippet_path = root / "scripts/deposit_snippet.txt"
section_path = root / "src/pages/admin/PaymentsSection.tsx"

t = snippet_path.read_text(encoding="utf-8")
t = t.replace('<motion.div className="grid', '<div className="grid')
wrong = "</" + "motion.div>"
right = "</" + "div>"
t = t.replace(wrong, right)
snippet_path.write_text(t, encoding="utf-8")

lines = section_path.read_text(encoding="utf-8").splitlines()
idx = next(i for i, l in enumerate(lines) if "Bật/tắt nhận thanh toán qua ngân hàng này" in l) - 2
snippet = snippet_path.read_text(encoding="utf-8").splitlines()
lines[idx:idx] = snippet
for i, l in enumerate(lines):
    if "Bật/tắt nhận thanh toán qua ngân hàng này" in l:
        lines[i] = l.replace("ngân hàng này", "cổng này")
section_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
print("done", idx + 1)
