from pathlib import Path

p = Path(r"e:\tainguyen_17_5_2026\tainguyen_15_5_2026\src\pages\admin\CreateServiceSection.tsx")
text = p.read_text(encoding="utf-8")
start = text.index("function CreateItemModal(")
end = text.index("\nfunction ServiceShopBlock(", start)
new_modal = Path(__file__).with_name("create_item_modal.txt").read_text(encoding="utf-8")
p.write_text(text[:start] + new_modal + text[end:], encoding="utf-8")
print("patched", end - start, "chars")
