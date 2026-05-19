from pathlib import Path

root = Path(__file__).resolve().parents[1]
section = root / "src/pages/admin/PaymentsSection.tsx"
text = section.read_text(encoding="utf-8")
DC = "</" + "div>"

# Header buttons
old_btn = """        <button
          type="button"
          onClick={() => setShowAddBankModal(true)}
          className="flex items-center gap-2 self-start rounded-xl bg-brand-primary px-4 py-2.5 text-[12px] font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4" />
          Thêm ngân hàng
        </button>
      </div>"""

new_btn = """        <motion.div className="flex flex-wrap gap-2 self-start">
          <button
            type="button"
            onClick={() => setShowAddBankModal(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-[12px] font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4" />
            Thêm ngân hàng
          </button>
          <button
            type="button"
            onClick={() => setShowAddThirdPartyModal(true)}
            className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-[12px] font-bold text-violet-700 hover:bg-violet-100"
          >
            <Layers className="h-4 w-4" />
            Thêm nhà cung cấp thứ 3
          </button>
        </motion.div>""".replace("<motion.div", "<" + "div", 1).replace("</motion.div>", DC, 1)

if old_btn in text:
    text = text.replace(old_btn, new_btn, 1)

if "Lưu ý nạp tiền chung" not in text:
    insert_after = """            </button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Danh sách ngân hàng */}"""
    insert_after = insert_after.replace("</motion.div>", DC)
    if insert_after not in text:
        insert_after = """            </button>
          </div>
        </div>
      </div>

      {/* Danh sách ngân hàng */}"""
    note = """
        <div className="mt-4 lg:col-span-2">
          <label className="mb-2 block text-xs font-bold uppercase text-zinc-500">
            Lưu ý nạp tiền chung (trang khách hàng)
          </label>
          <textarea
            value={globalDepositNote}
            onChange={(e) => setGlobalSettings((s) => ({ ...s, globalDepositNote: e.target.value }))}
            rows={4}
            placeholder="Lưu ý hiển thị cho tất cả khách hàng khi vào trang nạp tiền..."
            className={`${inputClass} resize-y text-[13px] font-medium`}
          />
        </motion.div>
""".replace("</motion.div>", DC)
    if insert_after in text:
        text = text.replace(insert_after, note + insert_after, 1)
    else:
        text = text.replace(
            "      </div>\n\n      {/* Danh sách ngân hàng */}",
            note + "      </div>\n\n      {/* Danh sách ngân hàng */}",
            1,
        )

text = text.replace(
    "onChange={(e) => setGlobalWebhook(e.target.value)}",
    "onChange={(e) => setGlobalSettings((s) => ({ ...s, globalWebhook: e.target.value }))}",
)
text = text.replace(
    "onClick={() => setAutoConfirm(!autoConfirm)}",
    "onClick={() => setGlobalSettings((s) => ({ ...s, autoConfirm: !s.autoConfirm }))}",
)

text = text.replace("                  Người dùng\n", "                  Username\n")
text = text.replace("                  Mã tham chiếu\n", "                  Mã giao dịch\n")
text = text.replace("{tx.user}", "{tx.username}")

if "handleAddProvider" not in text and "handleAddBank" in text:
    text = text.replace("handleAddBank", "handleAddProvider")

text = text.replace("AddBankModal", "AddProviderModal")

if "showAddThirdPartyModal &&" not in text:
    text = text.replace(
        """        {showAddBankModal && (
          <AddProviderModal
            key="add-bank"
            banks={ALL_BANK_TEMPLATES}
            existingIds={existingBankIds}
            onClose={() => setShowAddBankModal(false)}
            onAdd={handleAddProvider}
          />
        )}""",
        """        {showAddBankModal && (
          <AddProviderModal
            key="add-bank"
            title="Thêm ngân hàng"
            subtitle="Chọn ngân hàng để tích hợp API"
            banks={ALL_BANK_TEMPLATES}
            existingIds={existingBankIds}
            onClose={() => setShowAddBankModal(false)}
            onAdd={handleAddProvider}
          />
        )}
        {showAddThirdPartyModal && (
          <AddProviderModal
            key="add-3p"
            title="Thêm nhà cung cấp thứ 3"
            subtitle="MoMo, VNPay, PayPal, Stripe..."
            banks={THIRD_PARTY_CATALOG}
            existingIds={existingBankIds}
            onClose={() => setShowAddThirdPartyModal(false)}
            onAdd={handleAddProvider}
          />
        )}""",
    )
elif 'title="Thêm ngân hàng"' not in text:
    pass

if "NCC thứ 3" not in text:
    text = text.replace(
        '<p className="text-sm font-bold text-zinc-900">{gateway.shortName}</p>',
        """<div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-bold text-zinc-900">{gateway.shortName}</p>
                      {gateway.providerType === 'third_party' && (
                        <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold text-violet-700">
                          NCC thứ 3
                        </span>
                      )}
                    </motion.div>""".replace("</motion.div>", DC),
        1,
    )
    text = text.replace(
        '<p className="truncate text-[11px] text-zinc-500">{gateway.bankName}</p>',
        """<p className="truncate text-[11px] text-zinc-500">{gateway.bankName}</p>
                      <p className="text-[10px] font-semibold text-brand-primary">
                        Tối thiểu {formatMinDeposit(gateway.minDepositAmount, gateway.minDepositCurrency)}
                      </p>""",
        1,
    )

section.write_text(text, encoding="utf-8")

# DepositPage: fix wrong motion closes
dep = root / "src/pages/DepositPage.tsx"
lines = dep.read_text(encoding="utf-8").splitlines()
wrong_close = "</" + "motion.div>"
right_close = "</" + "motion.div>"
for i, line in enumerate(lines):
    if line.strip() == wrong_close:
        # keep motion closes only for lines 86-87 area (animated panel)
        if i not in (85, 86) and not (lines[i - 1].strip().startswith("</motion.div") if i > 0 else False):
            context = "".join(lines[max(0, i - 5) : i + 1])
            if "<motion.div" in context and "initial=" in context:
                continue
            if any(lines[j].strip().startswith("<motion.div") for j in range(max(0, i - 8), i) if "initial=" in lines[j]):
                continue
            lines[i] = line.replace(wrong_close, right_close)
# simpler global for deposit page except last two motion closes
t = "\n".join(lines)
opens_motion = [i for i, l in enumerate(lines) if l.strip().startswith("<motion.div") and "initial=" in l]
motion_close_idxs = [i for i, l in enumerate(lines) if l.strip() == wrong_close]
for i in motion_close_idxs:
    if i < 88:  # before end animated section inner
        lines[i] = lines[i].replace(wrong_close, right_close)
dep.write_text("\n".join(lines) + "\n", encoding="utf-8")

# App + Navbar
app = root / "src/App.tsx"
app_text = app.read_text(encoding="utf-8")
if "'deposit'" not in app_text:
    app_text = app_text.replace(
        "import OrderHistory from './pages/OrderHistory';",
        "import OrderHistory from './pages/OrderHistory';\nimport DepositPage from './pages/DepositPage';",
    )
    app_text = app_text.replace(
        "{currentPage === 'order-history' ? (\n          <OrderHistory />\n        ) : (",
        "{currentPage === 'order-history' ? (\n          <OrderHistory />\n        ) : currentPage === 'deposit' ? (\n          <DepositPage />\n        ) : (",
    )
    app.write_text(app_text, encoding="utf-8")

admin = root / "src/pages/admin/AdminPage.tsx"
admin_text = admin.read_text(encoding="utf-8")
if "'deposit'" not in admin_text:
    admin_text = admin_text.replace(
        "export type AppPage = 'home' | 'order-history' | 'admin';",
        "export type AppPage = 'home' | 'order-history' | 'deposit' | 'admin';",
    )
    admin.write_text(admin_text, encoding="utf-8")

nav = root / "src/components/Navbar.tsx"
nav_text = nav.read_text(encoding="utf-8")
if "onNavigate?.('deposit')" not in nav_text:
    nav_text = nav_text.replace(
        """              <a href="#" className="flex items-center gap-1.5 text-orange-500 font-black text-[13px] uppercase tracking-wider hover:text-brand-primary transition-all ml-2">
                <span className="relative">Nạp tiền</span>
              </a>""",
        """              <button
                type="button"
                onClick={() => onNavigate?.('deposit')}
                className="flex items-center gap-1.5 text-orange-500 font-black text-[13px] uppercase tracking-wider hover:text-brand-primary transition-all ml-2"
              >
                <span className="relative">Nạp tiền</span>
              </button>""",
    )
    nav.write_text(nav_text, encoding="utf-8")

print("done")
