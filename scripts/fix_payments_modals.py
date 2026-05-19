from pathlib import Path

p = Path(r"e:\tainguyen_17_5_2026\tainguyen_15_5_2026\src\pages\admin\PaymentsSection.tsx")
text = p.read_text(encoding="utf-8")
start = text.index("function AddBankModal(")
end = text.index("function GatewayBankTable(", start)
new = Path(r"e:\tainguyen_17_5_2026\tainguyen_15_5_2026\scripts\payments_modals.txt").read_text(encoding="utf-8")
p.write_text(text[:start] + new + text[end:], encoding="utf-8")
print("ok")
