import React from 'react';

import PropTypes from 'prop-types';

import { cn } from '@spyne-console/utils/cn';

function Toggle({ id, toggle, toggleHandler, disabled, className }) {
  return (
    <label
      htmlFor={id}
      aria-label={`Toggle ${id}`}
      className={cn(
        'inline-block cursor-pointer items-center align-middle',
        className
      )}
    >
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={toggle}
          onChange={toggleHandler}
          disabled={disabled}
        />

        <div
          className={`h-4 w-8 rounded-xl transition-all ${
            toggle ? 'bg-blue-light/20' : 'bg-gray-200'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <div
            className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full shadow transition-all duration-300 ease-in-out hover:shadow-[0px_0px_0px_6px_rgba(145,158,171,0.08)] lg:h-5 lg:w-5 ${
              toggle ? 'bg-blue-light right-0' : 'left-0 bg-white'
            } ${disabled ? 'cursor-not-allowed hover:shadow-none' : ''}`}
          ></div>
        </div>
      </div>
    </label>
  );
}

Toggle.propTypes = {
  id: PropTypes.string.isRequired,
  toggle: PropTypes.bool.isRequired,
  toggleHandler: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Toggle;
