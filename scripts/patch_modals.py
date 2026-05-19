from pathlib import Path

path = Path(__file__).resolve().parents[1] / "src/pages/admin/PaymentsModals.tsx"
text = path.read_text(encoding="utf-8")
mclose = "</motion.div>"

text = text.replace(
    """        </motion.div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}

export function TransactionDetailModal""",
    f"""        </motion.div>
      {mclose}
    {mclose}
  );

  return createPortal(modal, document.body);
}}

export function TransactionDetailModal""",
    1,
)

text = text.replace(
    """          <motion.div>
            <h3 className="text-base font-black text-zinc-900">Chi tiết giao dịch</h3>""",
    """          <motion.div>
            <h3 className="text-base font-black text-zinc-900">Chi tiết giao dịch</h3>""",
)

text = text.replace("<motion.div>\n            <h3 className=\"text-base font-black text-zinc-900\">Chi tiết", "<div>\n            <h3 className=\"text-base font-black text-zinc-900\">Chi tiết")

text = text.replace(
    """        <motion.div className="border-t border-zinc-100 px-6 py-3">""",
    """        <div className="border-t border-zinc-100 px-6 py-3">""",
)

text = text.replace(
    """        </motion.div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}
""",
    f"""        </motion.div>
      {mclose}
    {mclose}
  );

  return createPortal(modal, document.body);
}}
""",
)

path.write_text(text, encoding="utf-8")
print("patched")
