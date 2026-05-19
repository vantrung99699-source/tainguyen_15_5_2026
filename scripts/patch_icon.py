from pathlib import Path

p = Path('src/pages/admin/CreateServiceSection.tsx')
text = p.read_text(encoding='utf-8')
marker_start = '          <div>\n            <FormFieldLabel required>Icon:</FormFieldLabel>'
marker_end = '          <div>\n            <FormFieldLabel required>Trạng thái:</FormFieldLabel>'
start = text.index(marker_start)
end = text.index(marker_end, start)
new_block = Path('scripts/icon_block.txt').read_text(encoding='utf-8')
text = text[:start] + new_block + text[end:]
p.write_text(text, encoding='utf-8')
print('patched', start, end)
