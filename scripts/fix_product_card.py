from pathlib import Path

p = Path("src/components/ProductCard.tsx")
lines = p.read_text(encoding="utf-8").splitlines()
stack = []
out = []
for line in lines:
    stripped = line.strip()
    if stripped.startswith("<motion.div") and not stripped.endswith("/>"):
        stack.append("motion.div")
        out.append(line)
    elif stripped.startswith("<div") and not stripped.endswith("/>"):
        stack.append("motion.div")
        out.append(line)
    elif stripped == "</motion.div>":
        if stack and stack[-1] == "motion.div":
            out.append(line)
        else:
            out.append(line.replace("</motion.div>", "</motion.div>"))
        if stack:
            stack.pop()
    elif stripped.startswith("<motion.div") and stripped.endswith("/>"):
        out.append(line.replace("<motion.div", "<motion.div"))
    else:
        out.append(line)

text = "\n".join(out) + "\n"
text = text.replace("<motion.div className=\"mt-auto", "<motion.div className=\"mt-auto")
text = text.replace("<motion.div className=\"mt-auto", "<motion.div className=\"mt-auto")

# manual fixes
text = text.replace('<motion.div className="mt-auto flex gap-2 pt-3">', '<motion.div className="mt-auto flex gap-2 pt-3">')
text = text.replace('<motion.div className="mt-auto flex gap-2 pt-3">', '<motion.div className="mt-auto flex gap-2 pt-3">')

replacements = [
    ('<motion.div className="mt-auto flex gap-2 pt-3">', '<motion.div className="mt-auto flex gap-2 pt-3">'),
]
# Actually do direct replacements for known bad lines
fixes = [
    ('          <motion.div className="mt-auto flex gap-2 pt-3">', '          <motion.div className="mt-auto flex gap-2 pt-3">'),
]
# Simpler: read original good file from git? 

p.write_text(text, encoding="utf-8")
print("done")
