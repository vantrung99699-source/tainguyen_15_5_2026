from pathlib import Path

path = Path(__file__).resolve().parents[1] / "src/pages/admin/PaymentsModals.tsx"
lines = path.read_text(encoding="utf-8").splitlines()

d = "div"
m = "motion.div"

lines[98] = f"      </{m}>"
lines[99] = f"    </{m}>"
lines[129] = f"          <{d}>"
lines[169] = f'        <{d} className="border-t border-zinc-100 px-6 py-3">'
lines[177] = f"        </{d}>"
lines[178] = f"      </{m}>"
lines[179] = f"    </{m}>"

path.write_text("\n".join(lines) + "\n", encoding="utf-8")
print("ok")
