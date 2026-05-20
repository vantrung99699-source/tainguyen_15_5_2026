from pathlib import Path

path = Path("src/App.tsx")
t = path.read_text(encoding="utf-8")

old_grid = """          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {categoryProducts.slice(0, 4).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>"""

new_grid = """          <motion.div className={sectionGridClass}>
            {categoryProducts.slice(0, design.categorySectionLayout === 'list' ? 6 : 4).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} variant={sectionCardStyle} />
            ))}
          </motion.div>"""

# use div not motion
new_grid = new_grid.replace("motion.div", "div")

if old_grid.replace("motion.div", "motion.div") not in t:
    old_grid = old_grid.replace("motion.div", "motion.div")

# actual file uses div
old_grid = """          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">""".replace("motion.", "div.")
old_grid = """          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">"""

t = t.replace(
    """          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {categoryProducts.slice(0, 4).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>""".replace("motion.div", "motion.div"),
    """          <motion.div className={sectionGridClass}>
            {categoryProducts.slice(0, design.categorySectionLayout === 'list' ? 6 : 4).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} variant={sectionCardStyle} />
            ))}
          </motion.div>""".replace("motion.div", "motion.div"),
)

# simpler exact match from file
t = path.read_text(encoding="utf-8")
a = """          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">"""
if a not in t:
    a = '          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">'
if a not in t:
    a = '          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">'

# read exact lines 89-93
lines = t.splitlines()
for i,l in enumerate(lines[88:93], start=89):
    print(i, repr(l))
