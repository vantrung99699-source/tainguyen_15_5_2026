from pathlib import Path

p = Path(r"e:\tainguyen_17_5_2026\tainguyen_15_5_2026\src\pages\admin\CreateServiceSection.tsx")
text = p.read_text(encoding="utf-8")
bad1 = "        {hint}\n      </" + "motion.div>,\n      document.body"
good1 = "        {hint}\n      </" + "div>,\n      document.body"
bad2 = "      {hintTooltip}\n    </" + "motion.div>\n  );\n}\n\nfunction CategoryIconAvatar"
good2 = "      {hintTooltip}\n    </" + "motion.div>\n  );\n}\n\nfunction CategoryIconAvatar".replace("motion.", "")
if bad1 not in text:
    raise SystemExit("bad1 not found")
if bad2 not in text:
    raise SystemExit("bad2 not found")
text = text.replace(bad1, good1, 1).replace(bad2, good2, 1)
p.write_text(text, encoding="utf-8")
print("fixed")
