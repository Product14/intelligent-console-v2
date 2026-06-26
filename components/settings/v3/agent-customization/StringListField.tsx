import React from 'react';
import { FiTrash2 } from 'react-icons/fi';

interface StringListFieldProps {
  title: string;
  description: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
}

const StringListField: React.FC<StringListFieldProps> = ({
  title,
  description,
  placeholder,
  values,
  onChange,
  error,
}) => {
  const handleItemChange = (index: number, value: string) => {
    const updated = [...values];
    updated[index] = value;
    onChange(updated);
  };

  const lastItemEmpty =
    values.length > 0 && values[values.length - 1].trim() === '';

  const handleAddItem = () => {
    if (lastItemEmpty) return;
    onChange([...values, '']);
  };

  const handleRemoveItem = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-black/10 bg-white p-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold leading-7 text-black/80">
          {title}
        </h3>
        <p className="text-sm font-normal leading-tight text-black/60">
          {description}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {values.map((item, index) => {
          const isEmpty = error && item.trim() === '';
          return (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
                placeholder={placeholder}
                className={`flex-1 rounded-lg border bg-white px-3 py-2.5 text-sm font-normal leading-tight text-black/80 placeholder:text-black/40 focus:outline-none ${
                  isEmpty
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-black/10 focus:border-[#4600f2]'
                }`}
              />
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="flex h-[39.5px] items-center justify-center rounded-lg border border-black/10 bg-white px-3 text-black/40 transition-colors hover:border-red-300 hover:text-red-500"
                aria-label="Remove item"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          );
        })}
        {error && <span className="text-xs text-red-500">{error}</span>}

        <button
          type="button"
          onClick={handleAddItem}
          disabled={lastItemEmpty}
          className="flex items-center gap-2 self-start rounded-lg border border-dashed border-black/20 px-4 py-2 text-sm font-medium text-black/60 transition-colors hover:border-black/40 hover:text-black/80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 4v8M4 8h8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Add item
        </button>
      </div>
    </div>
  );
};

export default StringListField;
