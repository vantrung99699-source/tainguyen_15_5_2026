from pathlib import Path

p = Path(r"e:\tainguyen_17_5_2026\tainguyen_15_5_2026\src\pages\admin\CreateServiceSection.tsx")
text = p.read_text(encoding="utf-8")
old = """                            {item.enabled ? 'Đang bán' : 'Đã tắt'}
                          </span>
                        </motion.div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">"""
new = """                            {item.enabled ? 'Đang bán' : 'Đã tắt'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">"""
if old not in text:
    raise SystemExit("pattern not found")
p.write_text(text.replace(old, new, 1), encoding="utf-8")
print("fixed")
