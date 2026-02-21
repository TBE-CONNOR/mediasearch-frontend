import { useState, useRef, useEffect, useId } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import type { FileItem } from '@/api/files';

export function FileFilter({
  files,
  selected,
  onChange,
}: {
  files: FileItem[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  // Focus first checkbox when dropdown opens
  useEffect(() => {
    if (open && listRef.current) {
      const first = listRef.current.querySelector<HTMLInputElement>('input[type="checkbox"]');
      first?.focus();
    }
  }, [open]);

  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  };

  return (
    <div ref={ref} className="relative mt-3 flex items-center gap-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
      >
        <Filter className="h-3.5 w-3.5" />
        {selected.length === 0
          ? 'Filter by file'
          : `${selected.length} file${selected.length > 1 ? 's' : ''} selected`}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {selected.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Clear
        </button>
      )}

      {open && (
        <div
          ref={listRef}
          id={listId}
          role="group"
          aria-label="Filter by file"
          className="absolute left-0 top-full z-10 mt-1 max-h-52 w-72 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {files.map((f) => (
            <label
              key={f.file_id}
              className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selected.includes(f.file_id)}
                onChange={() => toggle(f.file_id)}
                className="rounded border-gray-300"
              />
              <span className="truncate text-sm text-gray-700">
                {f.file_name}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
