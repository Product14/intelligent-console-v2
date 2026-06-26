import React, { useRef, useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';

interface DynamicStringListFieldProps {
  label: string;
  placeholder: string;
  helperText: string;
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
  addLabel?: string;
}

interface ListItem {
  value: string;
  touched: boolean;
}

export default function DynamicStringListField({
  label,
  placeholder,
  helperText,
  values,
  onChange,
  error,
  addLabel = 'Add Item',
}: DynamicStringListFieldProps) {
  const [items, setItems] = useState<ListItem[]>(
    values.map((v) => ({ value: v, touched: false }))
  );
  const lastInputRef = useRef<HTMLInputElement>(null);

  const canAddMore =
    items.length === 0 || items[items.length - 1].value.trim() !== '';

  const emit = (updated: ListItem[]) => {
    onChange(updated.map((i) => i.value).filter((v) => v.trim() !== ''));
  };

  const handleAdd = () => {
    if (!canAddMore) return;
    const updated = [...items, { value: '', touched: false }];
    setItems(updated);
    setTimeout(() => lastInputRef.current?.focus(), 0);
  };

  const handleChange = (index: number, value: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, value } : item
    );
    setItems(updated);
    emit(updated);
  };

  const handleBlur = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, touched: true } : item))
    );
  };

  const handleRemove = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    emit(updated);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-base font-semibold text-black">{label}</label>

      <div className="flex flex-col gap-2">
        {items.map((item, index) => {
          const hasItemError = item.touched && !item.value.trim();
          const isLast = index === items.length - 1;

          return (
            <div key={index} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <input
                  ref={isLast ? lastInputRef : undefined}
                  type="text"
                  value={item.value}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onBlur={() => handleBlur(index)}
                  placeholder={placeholder}
                  className={`flex w-full items-center gap-2.5 rounded-lg border bg-white px-3.5 py-3 text-sm font-normal leading-tight text-black/80 outline-none transition-all placeholder:text-black/30 hover:border-black/20 ${
                    hasItemError
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-black/10 focus:border-[#4600F2]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-black/30 transition-all hover:bg-red-50 hover:text-red-500"
                  aria-label={`Remove item ${index + 1}`}
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>

              {hasItemError && (
                <p className="pl-1 text-xs text-red-500">
                  This field is required.
                </p>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAddMore}
          className="flex items-center gap-1.5 self-start rounded-lg border border-dashed border-black/20 px-3.5 py-2.5 text-sm font-medium text-black/50 transition-all hover:border-[#4600F2] hover:text-[#4600F2] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiPlus className="h-4 w-4" />
          {addLabel}
        </button>
      </div>

      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <p className="text-sm text-black/60">{helperText}</p>
      )}
    </div>
  );
}
