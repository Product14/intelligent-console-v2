'use client';

import React from 'react';

import { cn } from '@spyne-console/utils/cn';

function RadioButton({
  id,
  name = 'menuOption',
  label,
  check,
  onChange,
  disabledUncheck = false,
  disabledCheck = false,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className={cn(
          'mr-2.5 inline-flex items-center',
          !disabledUncheck && 'cursor-pointer' // Add cursor-pointer only if not disabled
        )}
      >
        <input
          type="radio"
          id={id}
          name={name}
          value={label}
          checked={check}
          onChange={onChange}
          className="peer absolute opacity-0"
          disabled={disabledUncheck || disabledCheck}
          aria-checked={check}
          aria-disabled={disabledUncheck || disabledCheck}
          role="radio"
        />
        <div
          className={cn(
            'relative mr-2.5 flex h-5 w-5 items-center justify-center rounded-full p-1',
            disabledUncheck && disabledCheck
              ? "border-none bg-[url('https://spyne-static.s3.amazonaws.com/console/project/disable-radio.svg')]"
              : disabledUncheck
                ? 'border-2 border-[rgba(145,158,171,0.8)]'
                : `border-typography-400 before:bg-blue-light-500/[0.08] after:bg-blue-light peer-checked:border-blue-light border-2 before:absolute before:h-10 before:w-10 before:scale-0 before:rounded-full before:content-[''] after:block after:h-full after:w-full after:scale-0 after:rounded-full after:transition-transform after:duration-150 after:content-[''] hover:before:scale-100 peer-checked:after:scale-100`
          )}
        />
        {label && <span className="text-sm">{label}</span>}
      </label>
    </div>
  );
}

export default RadioButton;
