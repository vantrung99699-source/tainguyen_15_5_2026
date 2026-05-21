import type { ReactNode } from 'react';

interface ApiFieldSyncToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ApiFieldSyncToggle({ checked, onChange, compact }: ApiFieldSyncToggleProps & { compact?: boolean }) {
  return (
    <label className={`inline-flex shrink-0 cursor-pointer items-center gap-1 ${compact ? 'gap-0.5' : 'gap-1.5'}`}>
      <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-wide text-sky-700 sm:text-[10px]">
        Đồng bộ NCC
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-sky-600' : 'bg-zinc-300'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'left-4' : 'left-0.5'
          }`}
        />
      </button>
    </label>
  );
}

interface ApiFieldLabelRowProps {
  label: ReactNode;
  required?: boolean;
  showSync?: boolean;
  syncChecked?: boolean;
  onSyncChange?: (checked: boolean) => void;
  syncLocked?: boolean;
}

export function ApiFieldLabelRow({
  label,
  required,
  showSync,
  syncChecked = false,
  onSyncChange,
  syncLocked = false,
}: ApiFieldLabelRowProps) {
  if (!showSync) {
    return (
      <label className="mb-1 block text-sm font-semibold leading-none text-zinc-800">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
    );
  }

  return (
    <div className="mb-1 flex items-center justify-between gap-1">
      <span className="min-w-0 truncate text-sm font-semibold leading-none text-zinc-800">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </span>
      {syncLocked ? (
        <span className="shrink-0 whitespace-nowrap text-[9px] font-bold uppercase tracking-wide text-sky-700">
          Đồng bộ NCC
        </span>
      ) : onSyncChange ? (
        <ApiFieldSyncToggle checked={syncChecked} onChange={onSyncChange} compact />
      ) : null}
    </div>
  );
}
