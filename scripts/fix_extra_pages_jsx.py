from pathlib import Path

path = Path(__file__).resolve().parents[1] / "src/pages/admin/ExtraPagesSection.tsx"
lines = path.read_text(encoding="utf-8").splitlines()
# fix table wrapper closings (lines 194-195, 1-based ~194)
for i, line in enumerate(lines):
    if line.strip() == "</motion.div>" and i > 0 and "overflow-x-auto" in lines[i - 1] if False else False:
        pass

text = path.read_text(encoding="utf-8")
old = "          </table>\n        </motion.div>\n      </motion.div>"
new = "          </table>\n        </div>\n      </div>"
if old in text:
    text = text.replace(old, new, 1)
    path.write_text(text, encoding="utf-8")
    print("fixed table")
else:
    print("pattern not found", repr(text[text.find("</table>"):text.find("</table>")+80]))
