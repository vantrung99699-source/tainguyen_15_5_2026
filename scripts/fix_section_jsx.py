from pathlib import Path
import re

p = Path(__file__).resolve().parents[1] / "src/pages/admin/PaymentsSection.tsx"
t = p.read_text(encoding="utf-8")

broken = """              />

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
        </div>
            </button>
          </motion.div>
        </motion.div>
      </motion.div>"""

fixed = """              />
            </button>
          </div>
          <motion.div className="mt-4 lg:col-span-2">
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
        </motion.div>
      </motion.div>"""

fixed = fixed.replace("<motion.div className=\"mt-4", "<div className=\"mt-4", 1)
fixed = fixed.replace("</motion.div>\n        </motion.div>\n      </motion.div>", "</div>\n        </div>\n      </div>", 1)

if broken.replace("</motion.div>", "</motion.div>") in t:
    pass
if broken in t:
    t = t.replace(broken, fixed, 1)
else:
    # try with div closes in broken
    b2 = broken.replace("</motion.div>", "</" + "div>")
    f2 = fixed
    if b2 in t:
        t = t.replace(b2, f2, 1)
    else:
        print("WARN broken block not found")

t = t.replace("handleAddBank", "handleAddProvider")
t = t.replace("showAddProviderModal", "showAddBankModal")
t = t.replace("setShowAddProviderModal", "setShowAddBankModal")

modals = """        {showAddBankModal && (
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
        )}"""

t = re.sub(
    r"\{showAddBankModal && \(\s*<AddProviderModal.*?\)\}\s*",
    modals + "\n",
    t,
    count=1,
    flags=re.S,
)

# Fix closing tag at end
t = t.replace("    </motion.div>\n  );\n}\n", "    </motion.div>\n  );\n}\n")

p.write_text(t, encoding="utf-8")
print("fixed")
