from pathlib import Path

p = Path('src/pages/admin/CreateServiceSection.tsx')
text = p.read_text(encoding='utf-8')
start = text.index('            <FormFieldLabel required>Icon:</FormFieldLabel>\n            <p className="mb-2')
end = text.index('            {iconError && <p className="mt-1 text-[12px] font-medium text-red-600">{iconError}</p>}', start)
end = text.index('\n', end) + 1
new_block = Path('scripts/icon_mode_block.txt').read_text(encoding='utf-8')
text = text[:start] + new_block + text[end:]
p.write_text(text, encoding='utf-8')
print('done')
