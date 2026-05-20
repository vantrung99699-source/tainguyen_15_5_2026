from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
p = ROOT / "src/components/Navbar.tsx"
text = p.read_text(encoding="utf-8")

top_start = text.find("      {/* Header Top - Becomes relative so it scrolls away */}")
main_start = text.find("      {/* Main Header - Always Sticky */}")
marquee_start = text.find("      {/* Clean Marquee Ticker - Scrolled state hides this */}")
auth_start = text.find("      {/* Auth Modal */}")

new_top = (ROOT / "scripts/topbar_snippet.txt").read_text(encoding="utf-8")
new_marquee = (ROOT / "scripts/marquee_snippet.txt").read_text(encoding="utf-8")

text = text[:top_start] + new_top + text[main_start:marquee_start] + new_marquee + text[auth_start:]
p.write_text(text, encoding="utf-8")
print("patched", p)
