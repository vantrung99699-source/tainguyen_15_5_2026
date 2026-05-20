from pathlib import Path

p = Path(__file__).resolve().parents[1] / "src/pages/admin/CreateServiceSection.tsx"
text = p.read_text(encoding="utf-8")

if "loadServiceShops" not in text:
    text = text.replace(
        "import ItemSalesStatsModal from '../../components/admin/ItemSalesStatsModal';",
        """import ItemSalesStatsModal from '../../components/admin/ItemSalesStatsModal';
import { PreorderAdminTab } from './PreorderAdminTab';
import { loadServiceShops, saveServiceShops, syncItemStock } from '../../services/serviceShopConfig';
import { onStockUpdated } from '../../services/preorderService';""",
    )

text = text.replace(
    "  visibility: ShopStatus;\n}",
    "  visibility: ShopStatus;\n  preorderEnabled: boolean;\n  preorderMaxWaitDays: number;\n}",
    1,
)

text = text.replace(
    "  resources: StockResource[];\n}",
    "  resources: StockResource[];\n  preorderEnabled: boolean;\n  preorderMaxWaitDays: number;\n}",
    1,
)

text = text.replace(
    "function syncStock(item: ServiceItem): ServiceItem {\n  return { ...item, stock: item.resources.length };\n}",
    "function syncStock(item: ServiceItem): ServiceItem {\n  return syncItemStock(item);\n}",
)

old_vis = "  const [visibility, setVisibility] = useState<ShopStatus>(initialItem?.visibility ?? 'visible');"
new_vis = old_vis + """
  const [preorderEnabled, setPreorderEnabled] = useState(initialItem?.preorderEnabled ?? false);
  const [preorderMaxWaitDays, setPreorderMaxWaitDays] = useState(
    String(initialItem?.preorderMaxWaitDays ?? 3),
  );"""
text = text.replace(old_vis, new_vis)

text = text.replace(
    """              visibility,
            });
          }}
        >""",
    """              visibility,
              preorderEnabled,
              preorderMaxWaitDays: Math.max(1, Number(preorderMaxWaitDays) || 3),
            });
          }}
        >""",
    1,
)

preorder_ui = """
          <motion.div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4 space-y-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={preorderEnabled}
                onChange={(e) => setPreorderEnabled(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-violet-300 text-brand-primary"
              />
              <span>
                <span className="text-sm font-bold text-violet-900">Cho phép đặt trước</span>
                <span className="mt-0.5 block text-[12px] text-violet-700/80">
                  Khách đặt trước khi hết hàng — admin duyệt, tự giao khi có kho, quá hạn tự hoàn tiền
                </span>
              </span>
            </label>
            {preorderEnabled ? (
              <div>
                <FormFieldLabel>Thời gian chờ tối đa (ngày)</FormFieldLabel>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={preorderMaxWaitDays}
                  onChange={(e) => setPreorderMaxWaitDays(e.target.value)}
                  className={inputClass}
                />
                <p className="mt-1 text-[11px] text-violet-700/70">
                  Quá {preorderMaxWaitDays || 3} ngày chưa xác nhận → tự hoàn tiền cho khách
                </p>
              </div>
            ) : null}
          </div>

"""
text = text.replace(
    '          <div className="grid gap-4 sm:grid-cols-2">\n            <div>\n              <FormFieldLabel required>Kiểu bán</FormFieldLabel>',
    preorder_ui + '          <div className="grid gap-4 sm:grid-cols-2">\n            <motion.div>\n              <FormFieldLabel required>Kiểu bán</FormFieldLabel>',
)
text = text.replace(
    preorder_ui + '          <div className="grid gap-4 sm:grid-cols-2">\n            <motion.div>\n              <FormFieldLabel required>Kiểu bán</FormFieldLabel>',
    preorder_ui + '          <div className="grid gap-4 sm:grid-cols-2">\n            <div>\n              <FormFieldLabel required>Kiểu bán</FormFieldLabel>',
)

text = text.replace(
    "      enabled: data.visibility === 'visible',\n      resources: [],",
    "      enabled: data.visibility === 'visible',\n      preorderEnabled: data.preorderEnabled,\n      preorderMaxWaitDays: data.preorderMaxWaitDays,\n      resources: [],",
)

text = text.replace(
    "              enabled: data.visibility === 'visible',\n            })",
    "              enabled: data.visibility === 'visible',\n              preorderEnabled: data.preorderEnabled,\n              preorderMaxWaitDays: data.preorderMaxWaitDays,\n            })",
)

text = text.replace(
    "  const [shops, setShops] = useState<ServiceShop[]>(initialShops);",
    "  const [shops, setShops] = useState<ServiceShop[]>(() => loadServiceShops());\n  const [adminView, setAdminView] = useState<'shops' | 'preorders'>('shops');",
)

if "saveServiceShops(shops)" not in text:
    text = text.replace(
        "  const [showCreateShopModal, setShowCreateShopModal] = useState(false);",
        "  const [showCreateShopModal, setShowCreateShopModal] = useState(false);\n\n  useEffect(() => {\n    saveServiceShops(shops);\n  }, [shops]);",
    )

text = text.replace(
    """    );
  };

  const totalItems = shops.reduce""",
    """    );
    onStockUpdated(shopId, itemId);
  };

  const totalItems = shops.reduce""",
)

tabs = """
      <div className="flex gap-1 border-b border-zinc-200">
        <button
          type="button"
          onClick={() => setAdminView('shops')}
          className={`rounded-t-lg px-4 py-2.5 text-[12px] font-bold ${adminView === 'shops' ? 'border border-b-0 border-zinc-200 bg-white text-brand-primary' : 'text-zinc-500'}`}
        >
          Shop & mặt hàng
        </button>
        <button
          type="button"
          onClick={() => setAdminView('preorders')}
          className={`rounded-t-lg px-4 py-2.5 text-[12px] font-bold ${adminView === 'preorders' ? 'border border-b-0 border-zinc-200 bg-white text-brand-primary' : 'text-zinc-500'}`}
        >
          Đơn đặt trước
        </button>
      </div>

      {adminView === 'preorders' ? (
        <PreorderAdminTab />
      ) : (
        <>
"""
text = text.replace(
    '  return (\n    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">\n      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">',
    '  return (\n    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">' + tabs + '\n      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">',
)

text = text.replace(
    "      <AnimatePresence>\n        {showCreateShopModal && (",
    "        </>\n      )}\n\n      <AnimatePresence>\n        {showCreateShopModal && (",
)

# fix motion.div in preorder_ui
text = text.replace(
    '          <motion.div className="rounded-xl border border-violet-100',
    '          <div className="rounded-xl border border-violet-100',
)

# add preorder to initial shop items if still there
for snippet in [
    "        resources: [\n          { content: 'tiktok_user1|pass1'",
]:
    pass

p.write_text(text, encoding="utf-8")
print("done")
