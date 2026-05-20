from pathlib import Path

path = Path(__file__).resolve().parents[1] / "src/pages/admin/ExtraPagesSection.tsx"
lines = path.read_text(encoding="utf-8").splitlines()
wrong = "</" + "motion" + ".motion.div>"  # typo guard
wrong = "</" + "motion.div>"
right = "</motion.div>"
right = "</" + "motion.div>"  # still wrong
