from pathlib import Path

p = Path('src/pages/admin/CreateServiceSection.tsx')
text = p.read_text(encoding='utf-8')
start = text.index('            <div className="max-h-[200px] overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50/50 p-3">')
end = text.index('            <p className="my-3 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-400">', start)
new_block = Path('scripts/icon_dropdown.txt').read_text(encoding='utf-8')
text = text[:start] + new_block + text[end:]
p.write_text(text, encoding='utf-8')
print('patched')
