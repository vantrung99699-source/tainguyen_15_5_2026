path = r'e:\tainguyen_17_5_2026\tainguyen_15_5_2026\src\pages\admin\UsersSection.tsx'
with open(path, encoding='utf-8') as f:
    s = f.read()

marker = '      <motion.div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">'
if marker not in s:
    marker = '      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">'

toolbar = r'''      <div className="flex flex-wrap gap-2 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-sm">
        <button
          type="button"
          onClick={handleLogoutSelected}
          disabled={selectedIds.size === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <LogOut className="h-3.5 w-3.5" />
          Đăng xuất đã chọn
        </button>
        <button
          type="button"
          onClick={handleLogoutAll}
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-2 text-[11px] font-bold text-amber-800 hover:bg-amber-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          Đăng xuất tất cả
        </button>
        <span className="mx-1 hidden h-8 w-px bg-zinc-200 sm:inline" aria-hidden />
        <button
          type="button"
          onClick={handleRotateKeySelected}
          disabled={selectedIds.size === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-[11px] font-bold text-violet-800 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Đổi API Key đã chọn
        </button>
        <button
          type="button"
          onClick={handleRotateKeyAll}
          className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-3 py-2 text-[11px] font-bold text-violet-800 hover:bg-violet-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Đổi API Key tất cả
        </button>
        {selectedUsers.length > 0 ? (
          <p className="ml-auto self-center text-[11px] font-medium text-zinc-500">
            {selectedUsers.filter((u) => u.sessionActive).length}/{selectedUsers.length} đang online
            (đã chọn)
          </p>
        ) : null}
      </div>

'''

if 'Đăng xuất đã chọn' in s:
    print('toolbar already present')
elif marker not in s:
    print('marker not found')
else:
    s = s.replace(marker, toolbar + marker, 1)
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(s)
    print('inserted toolbar')
