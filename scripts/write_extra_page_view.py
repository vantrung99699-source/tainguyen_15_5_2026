from pathlib import Path

content = r'''import { ChevronLeft } from 'lucide-react';
import type { ExtraPage } from '../types/extraPage';

interface ExtraPageViewProps {
  page: ExtraPage;
  onBack: () => void;
}

export default function ExtraPageView({ page, onBack }: ExtraPageViewProps) {
  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-20">
      <motion.div className="mx-auto max-w-4xl px-6 pt-10">
        <div className="mb-8 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl p-2 transition-colors hover:bg-slate-100"
            aria-label="Quay lại"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800">{page.title}</h1>
            <p className="mt-0.5 text-[12px] font-medium text-slate-400">/{page.slug}</p>
          </motion.div>
        </motion.div>

        <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div
            className="text-sm font-medium leading-relaxed text-slate-700
              [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-black [&_h3]:text-slate-900
              [&_img]:my-4 [&_img]:max-h-96 [&_img]:w-auto [&_img]:max-w-full [&_img]:rounded-xl [&_img]:border [&_img]:border-slate-200
              [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5
              [&_p]:my-2 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5
              [&_a]:text-brand-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: page.content || '<p>Nội dung đang được cập nhật.</p>' }}
          />
        </article>
      </motion.div>
    </motion.div>
  );
}
'''

# fix motion typos to div
content = content.replace('motion.div', 'TMPDIV')
content = content.replace('TMPDIV', 'div')

Path(__file__).resolve().parents[1].joinpath('src/pages/ExtraPageView.tsx').write_text(content, encoding='utf-8')
print('written')
