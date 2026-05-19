from pathlib import Path

path = Path("src/pages/admin/CreateServiceSection.tsx")
text = path.read_text(encoding="utf-8")

start = text.index("          <div>\n            <FormFieldLabel required>Icon:</FormFieldLabel>")
end = text.index("\n          <div>\n            <FormFieldLabel required>Trạng thái:</FormFieldLabel>", start)

new_block = r'''          <motion.div>
            <FormFieldLabel required>Icon:</FormFieldLabel>
            <p className="mb-2 text-[12px] text-zinc-500">Chọn icon mạng xã hội / nền tảng có sẵn</p>
            <div className="max-h-[200px] overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50/50 p-3">
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {SOCIAL_ICON_PRESETS.map((preset) => {
                  const Icon =
                    (LucideIcons as Record<string, ComponentType<{ className?: string; style?: CSSProperties }>>)[
                      preset.icon
                    ] || LucideIcons.LayoutGrid;
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      title={preset.name}
                      onClick={() => selectPreset(preset.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all ${
                        isSelected
                          ? 'border-brand-primary bg-white shadow-md ring-2 ring-brand-primary/30'
                          : 'border-transparent bg-white hover:border-zinc-200 hover:shadow-sm'
                      }`}
                    >
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: preset.color || '#64748b' }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </span>
                      <span className="line-clamp-2 text-center text-[9px] font-bold leading-tight text-zinc-600">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            </motion.div>

            {(selectedPreset || iconPreview) && (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2">
                <CategoryIconAvatar preset={selectedPreset} iconUrl={iconPreview || undefined} size="sm" />
                <div className="min-w-0 text-[12px]">
                  <p className="font-bold text-zinc-800">
                    {selectedPreset ? selectedPreset.name : iconFile?.name}
                  </p>
                  <p className="text-zinc-500">{selectedPreset ? 'Icon có sẵn' : 'Icon tải lên'}</p>
                </motion.div>
              </motion.div>
            )}

            <p className="my-3 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              hoặc tải icon lên
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleIconChange}
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                Choose File
              </button>
              <span className="text-sm text-zinc-500">{iconFile ? iconFile.name : 'No file chosen'}</span>
            </motion.div>
            {iconError && <p className="mt-1 text-[12px] font-medium text-red-600">{iconError}</p>}
          </motion.div>'''

# fix wrong motion.div closings in new_block
new_block = new_block.replace(
    "              </motion.div>\n            </motion.div>\n\n            {(selectedPreset",
    "              </motion.div>\n            </motion.div>\n\n            {(selectedPreset",
)
new_block = new_block.replace("</motion.div>\n              </motion.div>", "</motion.div>\n              </motion.div>", 1)
new_block = new_block.replace(
    """              </motion.div>
            </motion.div>

            {(selectedPreset""",
    """              </motion.div>
            </motion.div>

            {(selectedPreset""",
)
# proper fixes
new_block = new_block.replace(
    "                })}\n              </motion.div>\n            </motion.div>",
    "                })}\n              </motion.div>\n            </motion.div>",
)
new_block = new_block.replace(
    "                })}\n              </motion.div>\n            </motion.div>",
    "                })}\n              </motion.div>\n            </motion.div>",
)

fixes = [
    ("              </motion.div>\n            </motion.div>\n\n            {(selectedPreset", "              </motion.div>\n            </motion.div>\n\n            {(selectedPreset"),
    ("                </motion.div>\n              </motion.div>\n            )}", "                </motion.div>\n              </motion.div>\n            )}"),
    ("            </motion.div>\n            {iconError", "            </motion.div>\n            {iconError"),
]
new_block = new_block.replace("              </motion.div>\n            </motion.div>", "              </motion.div>\n            </motion.div>")
# manual write clean block
new_block = """          <div>
            <FormFieldLabel required>Icon:</FormFieldLabel>
            <p className="mb-2 text-[12px] text-zinc-500">Chọn icon mạng xã hội / nền tảng có sẵn</p>
            <div className="max-h-[200px] overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50/50 p-3">
              <motion.div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {SOCIAL_ICON_PRESETS.map((preset) => {
                  const Icon =
                    (LucideIcons as Record<string, ComponentType<{ className?: string; style?: CSSProperties }>>)[
                      preset.icon
                    ] || LucideIcons.LayoutGrid;
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      title={preset.name}
                      onClick={() => selectPreset(preset.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all ${
                        isSelected
                          ? 'border-brand-primary bg-white shadow-md ring-2 ring-brand-primary/30'
                          : 'border-transparent bg-white hover:border-zinc-200 hover:shadow-sm'
                      }`}
                    >
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: preset.color || '#64748b' }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </span>
                      <span className="line-clamp-2 text-center text-[9px] font-bold leading-tight text-zinc-600">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            </motion.div>

            {(selectedPreset || iconPreview) && (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2">
                <CategoryIconAvatar preset={selectedPreset} iconUrl={iconPreview || undefined} size="sm" />
                <div className="min-w-0 text-[12px]">
                  <p className="font-bold text-zinc-800">
                    {selectedPreset ? selectedPreset.name : iconFile?.name}
                  </p>
                  <p className="text-zinc-500">{selectedPreset ? 'Icon có sẵn' : 'Icon tải lên'}</p>
                </motion.div>
              </motion.div>
            )}

            <p className="my-3 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              hoặc tải icon lên
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleIconChange}
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                Choose File
              </button>
              <span className="text-sm text-zinc-500">{iconFile ? iconFile.name : 'No file chosen'}</span>
            </motion.div>
            {iconError && <p className="mt-1 text-[12px] font-medium text-red-600">{iconError}</p>}
          </motion.div>"""

new_block = new_block.replace('<motion.div className="grid', '<motion.div className="grid').replace(
    '</motion.div>\n            </motion.div>\n\n            {(selectedPreset',
    '</motion.div>\n            </motion.div>\n\n            {(selectedPreset',
)
new_block = """          <div>
            <FormFieldLabel required>Icon:</FormFieldLabel>
            <p className="mb-2 text-[12px] text-zinc-500">Chọn icon mạng xã hội / nền tảng có sẵn</p>
            <div className="max-h-[200px] overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50/50 p-3">
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {SOCIAL_ICON_PRESETS.map((preset) => {
                  const Icon =
                    (LucideIcons as Record<string, ComponentType<{ className?: string; style?: CSSProperties }>>)[
                      preset.icon
                    ] || LucideIcons.LayoutGrid;
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      title={preset.name}
                      onClick={() => selectPreset(preset.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all ${
                        isSelected
                          ? 'border-brand-primary bg-white shadow-md ring-2 ring-brand-primary/30'
                          : 'border-transparent bg-white hover:border-zinc-200 hover:shadow-sm'
                      }`}
                    >
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: preset.color || '#64748b' }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </span>
                      <span className="line-clamp-2 text-center text-[9px] font-bold leading-tight text-zinc-600">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            </motion.div>

            {(selectedPreset || iconPreview) && (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2">
                <CategoryIconAvatar preset={selectedPreset} iconUrl={iconPreview || undefined} size="sm" />
                <div className="min-w-0 text-[12px]">
                  <p className="font-bold text-zinc-800">
                    {selectedPreset ? selectedPreset.name : iconFile?.name}
                  </p>
                  <p className="text-zinc-500">{selectedPreset ? 'Icon có sẵn' : 'Icon tải lên'}</p>
                </motion.div>
              </motion.div>
            )}

            <p className="my-3 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              hoặc tải icon lên
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleIconChange}
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                Choose File
              </button>
              <span className="text-sm text-zinc-500">{iconFile ? iconFile.name : 'No file chosen'}</span>
            </motion.div>
            {iconError && <p className="mt-1 text-[12px] font-medium text-red-600">{iconError}</p>}
          </motion.div>"""

# Final clean version - all div
new_block = """          <div>
            <FormFieldLabel required>Icon:</FormFieldLabel>
            <p className="mb-2 text-[12px] text-zinc-500">Chọn icon mạng xã hội / nền tảng có sẵn</p>
            <div className="max-h-[200px] overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50/50 p-3">
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {SOCIAL_ICON_PRESETS.map((preset) => {
                  const Icon =
                    (LucideIcons as Record<string, ComponentType<{ className?: string; style?: CSSProperties }>>)[
                      preset.icon
                    ] || LucideIcons.LayoutGrid;
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      title={preset.name}
                      onClick={() => selectPreset(preset.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all ${
                        isSelected
                          ? 'border-brand-primary bg-white shadow-md ring-2 ring-brand-primary/30'
                          : 'border-transparent bg-white hover:border-zinc-200 hover:shadow-sm'
                      }`}
                    >
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: preset.color || '#64748b' }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </span>
                      <span className="line-clamp-2 text-center text-[9px] font-bold leading-tight text-zinc-600">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            </motion.div>

            {(selectedPreset || iconPreview) && (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2">
                <CategoryIconAvatar preset={selectedPreset} iconUrl={iconPreview || undefined} size="sm" />
                <div className="min-w-0 text-[12px]">
                  <p className="font-bold text-zinc-800">
                    {selectedPreset ? selectedPreset.name : iconFile?.name}
                  </p>
                  <p className="text-zinc-500">{selectedPreset ? 'Icon có sẵn' : 'Icon tải lên'}</p>
                </motion.div>
              </motion.div>
            )}

            <p className="my-3 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              hoặc tải icon lên
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleIconChange}
            />
            <motion.div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                Choose File
              </button>
              <span className="text-sm text-zinc-500">{iconFile ? iconFile.name : 'No file chosen'}</span>
            </motion.div>
            {iconError && <p className="mt-1 text-[12px] font-medium text-red-600">{iconError}</p>}
          </motion.div>"""

# Write the CORRECT block only with div tags
new_block = """          <div>
            <FormFieldLabel required>Icon:</FormFieldLabel>
            <p className="mb-2 text-[12px] text-zinc-500">Chọn icon mạng xã hội / nền tảng có sẵn</p>
            <motion.div className="max-h-[200px] overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50/50 p-3">
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {SOCIAL_ICON_PRESETS.map((preset) => {
                  const Icon =
                    (LucideIcons as Record<string, ComponentType<{ className?: string; style?: CSSProperties }>>)[
                      preset.icon
                    ] || LucideIcons.LayoutGrid;
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      title={preset.name}
                      onClick={() => selectPreset(preset.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all ${
                        isSelected
                          ? 'border-brand-primary bg-white shadow-md ring-2 ring-brand-primary/30'
                          : 'border-transparent bg-white hover:border-zinc-200 hover:shadow-sm'
                      }`}
                    >
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: preset.color || '#64748b' }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </span>
                      <span className="line-clamp-2 text-center text-[9px] font-bold leading-tight text-zinc-600">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            </motion.div>

            {(selectedPreset || iconPreview) && (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2">
                <CategoryIconAvatar preset={selectedPreset} iconUrl={iconPreview || undefined} size="sm" />
                <div className="min-w-0 text-[12px]">
                  <p className="font-bold text-zinc-800">
                    {selectedPreset ? selectedPreset.name : iconFile?.name}
                  </p>
                  <p className="text-zinc-500">{selectedPreset ? 'Icon có sẵn' : 'Icon tải lên'}</p>
                </motion.div>
              </motion.div>
            )}

            <p className="my-3 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              hoặc tải icon lên
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleIconChange}
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                Choose File
              </button>
              <span className="text-sm text-zinc-500">{iconFile ? iconFile.name : 'No file chosen'}</span>
            </motion.div>
            {iconError && <p className="mt-1 text-[12px] font-medium text-red-600">{iconError}</p>}
          </motion.div>"""

# I'll write to file directly with correct divs only
new_block = open('scripts/icon_block.txt', 'w', encoding='utf-8')
new_block.write("""          <div>
            <FormFieldLabel required>Icon:</FormFieldLabel>
            <p className="mb-2 text-[12px] text-zinc-500">Chọn icon mạng xã hội / nền tảng có sẵn</p>
            <div className="max-h-[200px] overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50/50 p-3">
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {SOCIAL_ICON_PRESETS.map((preset) => {
                  const Icon =
                    (LucideIcons as Record<string, ComponentType<{ className?: string; style?: CSSProperties }>>)[
                      preset.icon
                    ] || LucideIcons.LayoutGrid;
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      title={preset.name}
                      onClick={() => selectPreset(preset.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all ${
                        isSelected
                          ? 'border-brand-primary bg-white shadow-md ring-2 ring-brand-primary/30'
                          : 'border-transparent bg-white hover:border-zinc-200 hover:shadow-sm'
                      }`}
                    >
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: preset.color || '#64748b' }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </span>
                      <span className="line-clamp-2 text-center text-[9px] font-bold leading-tight text-zinc-600">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            </motion.div>

            {(selectedPreset || iconPreview) && (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2">
                <CategoryIconAvatar preset={selectedPreset} iconUrl={iconPreview || undefined} size="sm" />
                <div className="min-w-0 text-[12px]">
                  <p className="font-bold text-zinc-800">
                    {selectedPreset ? selectedPreset.name : iconFile?.name}
                  </p>
                  <p className="text-zinc-500">{selectedPreset ? 'Icon có sẵn' : 'Icon tải lên'}</p>
                </motion.div>
              </motion.div>
            )}

            <p className="my-3 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              hoặc tải icon lên
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleIconChange}
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                Choose File
              </button>
              <span className="text-sm text-zinc-500">{iconFile ? iconFile.name : 'No file chosen'}</span>
            </motion.div>
            {iconError && <p className="mt-1 text-[12px] font-medium text-red-600">{iconError}</p>}
          </motion.div>""")
new_block.close()

print("wrote icon_block - fix manually")
