from pathlib import Path

path = Path(Path(__file__).resolve().parents[1] / "src/pages/admin/PaymentsSection.tsx")
text = path.read_text(encoding="utf-8")
END_DIV = "</" + "div>"
END_MOTION = "</" + "motion.div>"

def fix_wrong_motion_closes(block: str) -> str:
    """Replace </motion.div> with </motion.div> when stack top is plain div."""
    lines = block.splitlines(keepends=True)
    stack: list[str] = []
    out: list[str] = []
    for line in lines:
        s = line.lstrip()
        if s.startswith("<motion.div") and any(
            k in s for k in ("initial=", "animate=", "exit=", "transition=")
        ):
            stack.append("motion")
            out.append(line)
            continue
        if s.startswith("<motion.div"):
            stack.append("div")
            out.append(line.replace("<motion.div", "<div", 1))
            continue
        if s.startswith("<div"):
            stack.append("motion.div")
            out.append(line)
            continue
        if END_MOTION in line and s.strip() == END_MOTION:
            kind = stack.pop() if stack else "motion"
            if kind == "div":
                out.append(line.replace(END_MOTION, END_DIV, 1))
            else:
                out.append(line)
            continue
        out.append(line)
    return "".join(out)

for marker in ("function AddBankModal", "function TransactionDetailModal"):
    start = text.index(marker)
    end = text.index("\nfunction ", start + 10)
    block = text[start:end]
    text = text[:start] + fix_wrong_motion_closes(block) + text[end:]

path.write_text(text, encoding="utf-8")
print("ok")
