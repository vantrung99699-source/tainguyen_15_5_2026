from pathlib import Path
p = Path('src/pages/admin/ItemStockPage.tsx')
lines = p.read_text(encoding='utf-8').splitlines()
# Keep motion.div close only at lines that close motion opens (1-based from grep): 95->div now, 132, 133, 437
# Replace all </motion.div> with </div> first
text = '\n'.join(lines)
text = text.replace('</motion.div>', '</div>')
# Restore modal and page motion closes
text = text.replace(
    '      </motion.div>\n    </motion.div>\n  );\n\n  return createPortal',
    '      </motion.div>\n    </motion.div>\n  );\n\n  return createPortal',
)
# Modal closes - find pattern after form in AddSingleResourceModal
text = text.replace(
    '        </form>\n      </div>\n    </motion.div>\n  );\n\n  return createPortal',
    '        </form>\n      </motion.div>\n    </motion.div>\n  );\n\n  return createPortal',
)
# Page outer close - last before );
text = text.replace(
    '      </AnimatePresence>\n    </motion.div>\n  );\n}',
    '      </AnimatePresence>\n    </motion.div>\n  );\n}',
)
p.write_text(text, encoding='utf-8')
print('done')
