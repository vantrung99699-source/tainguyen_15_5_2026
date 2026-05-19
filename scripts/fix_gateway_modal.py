from pathlib import Path

p = Path(__file__).resolve().parents[1] / "src/pages/admin/PaymentsSection.tsx"
lines = p.read_text(encoding="utf-8").splitlines()

# Find deposit block start and kich hoat end
start = next(i for i, l in enumerate(lines) if "Nạp tiền (trang khách hàng)" in l) - 2
end = next(i for i, l in enumerate(lines) if "Bật/tắt nhận thanh toán qua cổng này" in l)

deposit = lines[start : next(i for i, l in enumerate(lines) if i > start and l.strip() == "</div>" and "depositNote" in "".join(lines[start:i])) + 1]

# find end of deposit inner block - line with closing after textarea's parent
idx = start
depth = 0
deposit_end = start
for i in range(start, len(lines)):
    if "depositNote" in lines[i]:
        for j in range(i, i + 15):
            if lines[j].strip() == "</div>":
                deposit_end = j
                break
        break

deposit_block = lines[start : deposit_end + 1]

# Remove erroneous flex wrapper line before deposit if present
if "flex items-center justify-between" in deposit_block[0]:
    deposit_block = deposit_block[1:]

kich_hoat_start = next(i for i, l in enumerate(lines) if "Bật/tắt nhận thanh toán qua cổng này" in i) - 1
kich_hoat_end = next(i for i, l in enumerate(lines) if i > kich_hoat_start and lines[i].strip() == "</div>" and "flex gap-2" in lines[i + 1])

new_section = deposit_block + [""] + lines[kich_hoat_start : kich_hoat_end + 1]

# Replace range from start to kich_hoat_end
lines = lines[:start] + new_section + lines[kich_hoat_end + 1 :]

p.write_text("\n".join(lines) + "\n", encoding="utf-8")
print("ok", start, kich_hoat_end)
