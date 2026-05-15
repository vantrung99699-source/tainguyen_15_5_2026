import { AlertCircle, ShieldCheck, Zap, PhoneCall, Send, Search } from 'lucide-react';
import { motion } from 'motion/react';

export default function HeroBanner() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
      {/* Disclaimer */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-50 border border-gray-200 rounded-xl p-6 relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
        <div className="flex items-start gap-4">
          <div className="bg-orange-100 p-3 rounded-full text-orange-500 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 tracking-tight text-sm uppercase">TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM ( QUAN TRỌNG )</h3>
            <p className="text-slate-500 text-[13px] leading-relaxed">
              Website chỉ cung cấp tài khoản mạng xã hội phục vụ quảng cáo và kinh doanh hợp pháp. Chúng tôi không chịu trách nhiệm nếu khách hàng sử dụng tài khoản mục đích vi phạm pháp luật Việt Nam.
              <br />
              <span className="text-orange-500 font-semibold mt-1 inline-block">xin chào</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Policy */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-slate-100 rounded-[20px] p-6 relative overflow-hidden shadow-sm"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary/40"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="bg-emerald-50 p-3 rounded-full text-brand-primary shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase">CHÍNH SÁCH BẢO HÀNH & NGUYÊN TẮC</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed max-w-2xl">
                Tất cả sản phẩm được bảo hành theo chế độ ghi ở đầu trang và ghi chú chi tiết. Vui lòng đọc kỹ trước khi thanh toán.
              </p>
              <a href="#" className="flex items-center text-brand-primary text-[13px] font-bold hover:underline pt-1">
                <Zap className="w-3.5 h-3.5 mr-1.5 fill-brand-primary" />
                Xem chính sách bảo hành chi tiết
              </a>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 shrink-0">
            <button className="flex items-center gap-2.5 bg-[#0F172A] text-white px-5 py-2.5 rounded-[14px] font-bold text-[12px] transition-all hover:bg-slate-800 shadow-sm">
              <img src="https://img.icons8.com/color/48/ffffff/zalo.png" className="w-4 h-4 grayscale brightness-200" alt="Zalo" />
              <span>Hỗ Trợ Zalo</span>
            </button>
            <button className="flex items-center gap-2.5 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-[14px] font-bold text-[12px] transition-all hover:bg-slate-50 shadow-sm">
              <Send className="w-4 h-4 text-brand-primary" />
              <span>Cộng Đồng Telegram</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
