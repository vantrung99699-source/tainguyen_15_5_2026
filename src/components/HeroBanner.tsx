import { AlertCircle, ShieldCheck, Zap, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { useHomeAnnouncements } from '../hooks/useHomeAnnouncements';
import { HtmlContent } from './common/HtmlContent';
import { isLikelyHtml, stripHtml } from '../utils/htmlContent';

function renderBody(content: string, highlightText: string) {
  const plain = stripHtml(content);
  const hasHtml = isLikelyHtml(content);

  return (
    <div className="text-slate-500 text-[13px] leading-relaxed">
      {hasHtml ? (
        <HtmlContent html={content} className="text-slate-500 [&_p]:my-1" />
      ) : (
        <p>{plain}</p>
      )}
      {highlightText.trim() ? (
        <span className="mt-1 inline-block font-semibold text-orange-500">{highlightText}</span>
      ) : null}
    </div>
  );
}

export default function HeroBanner() {
  const { disclaimer, policy } = useHomeAnnouncements();

  if (!disclaimer.enabled && !policy.enabled) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
      {disclaimer.enabled ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-50 border border-gray-200 rounded-xl p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-400" />
          <div className="flex items-start gap-4">
            <div className="bg-orange-100 p-3 rounded-full text-orange-500 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-2 min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 tracking-tight text-sm uppercase">
                {disclaimer.title}
              </h3>
              {renderBody(disclaimer.content, disclaimer.highlightText)}
            </div>
          </div>
        </motion.div>
      ) : null}

      {policy.enabled ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-slate-100 rounded-[20px] p-6 relative overflow-hidden shadow-sm"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary/40" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <div className="bg-emerald-50 p-3 rounded-full text-brand-primary shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase">
                  {policy.title}
                </h3>
                {renderBody(policy.content, policy.highlightText)}
                {policy.linkLabel.trim() ? (
                  <a
                    href={policy.linkUrl || '#'}
                    className="flex items-center text-brand-primary text-[13px] font-bold hover:underline pt-1"
                  >
                    <Zap className="w-3.5 h-3.5 mr-1.5 fill-brand-primary" />
                    {policy.linkLabel}
                  </a>
                ) : null}
              </div>
            </div>

            {policy.showZaloButton || policy.showTelegramButton ? (
              <div className="flex flex-wrap gap-3 shrink-0">
                {policy.showZaloButton ? (
                  <a
                    href={policy.zaloUrl || '#'}
                    className="flex items-center gap-2.5 bg-[#0F172A] text-white px-5 py-2.5 rounded-[14px] font-bold text-[12px] transition-all hover:bg-slate-800 shadow-sm"
                  >
                    <img
                      src="https://img.icons8.com/color/48/ffffff/zalo.png"
                      className="w-4 h-4 grayscale brightness-200"
                      alt="Zalo"
                    />
                    <span>Hỗ Trợ Zalo</span>
                  </a>
                ) : null}
                {policy.showTelegramButton ? (
                  <a
                    href={policy.telegramUrl || '#'}
                    className="flex items-center gap-2.5 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-[14px] font-bold text-[12px] transition-all hover:bg-slate-50 shadow-sm"
                  >
                    <Send className="w-4 h-4 text-brand-primary" />
                    <span>Cộng Đồng Telegram</span>
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
