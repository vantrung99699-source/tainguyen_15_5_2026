from pathlib import Path

path = Path(__file__).resolve().parents[1] / "src/components/admin/DetailDescriptionEditor.tsx"
text = path.read_text(encoding="utf-8")
marker = """      {aiError && (
        <p className="border-t border-red-100 bg-red-50 px-3 py-2 text-[12px] font-medium text-red-600">{aiError}</p>
      )}
    </motion.div>
  );
}"""

modal = """      {aiError && (
        <p className="border-t border-red-100 bg-red-50 px-3 py-2 text-[12px] font-medium text-red-600">{aiError}</p>
      )}

      {htmlModalOpen && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="html-editor-title"
          onClick={() => setHtmlModalOpen(false)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <div>
                <h4 id="html-editor-title" className="text-sm font-black text-zinc-900">
                  {htmlMode === 'replace' ? 'Sửa HTML toàn bộ' : 'Chèn HTML'}
                </h4>
                <p className="mt-0.5 text-[11px] font-medium text-zinc-500">
                  {htmlMode === 'replace'
                    ? 'Thay thế toàn bộ nội dung ô soạn thảo'
                    : 'HTML sẽ được chèn tại vị trí con trỏ trong ô soạn thảo'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHtmlModalOpen(false)}
                className="rounded-lg p-2 hover:bg-zinc-100"
                aria-label="Đóng"
              >
                <X className="h-5 w-5 text-zinc-500" />
              </button>
            </div>

            <motion.div className="flex-1 overflow-y-auto p-5">
              <textarea
                value={htmlDraft}
                onChange={(e) => setHtmlDraft(e.target.value)}
                spellCheck={false}
                className="min-h-[240px] w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-zinc-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                placeholder="<p>Nội dung HTML...</p>"
              />
              {htmlMode === 'insert' && (
                <p className="mt-2 text-[11px] text-zinc-400">
                  Gợi ý: đặt con trỏ trong ô soạn thảo trước khi mở hộp thoại để chèn đúng vị trí.
                </p>
              )}
            </motion.div>

            <motion.div className="flex justify-end gap-2 border-t border-zinc-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setHtmlModalOpen(false)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-[12px] font-bold text-zinc-600 hover:bg-zinc-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={applyHtmlDraft}
                className="rounded-xl bg-brand-primary px-5 py-2 text-[12px] font-black text-white hover:opacity-90"
              >
                Áp dụng
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}"""

# fix motion.div typos in script - use div only
modal = modal.replace("<motion.div", "<" + "motion.div").replace("</motion.div>", "</" + "motion.div>")
modal = modal.replace("<" + "motion.div", "<div").replace("</" + "motion.div>", "</div>")

old = """      {aiError && (
        <p className="border-t border-red-100 bg-red-50 px-3 py-2 text-[12px] font-medium text-red-600">{aiError}</p>
      )}
    </motion.div>
  );
}"""
old = old.replace("</motion.div>", "</div>")

if old not in text:
    old = old.replace("    </motion.div>", "    </div>")
if old not in text:
    raise SystemExit("marker not found")

if "htmlModalOpen &&" in text:
    print("already has modal")
else:
    text = text.replace(old, modal, 1)
    path.write_text(text, encoding="utf-8")
    print("added modal")
