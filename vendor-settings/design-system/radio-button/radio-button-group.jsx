'use client';

import React, { useState } from 'react';

import RadioButton from './radio-button';

function RadioButtonGroup() {
  const [selectedOption, setSelectedOption] = useState('Option1');

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div>
      <RadioButton
        id="option1"
        label="Option 1"
        check={selectedOption === 'Option 1'}
        onChange={handleChange}
      />
      <RadioButton
        id="option2"
        label="Option 2"
        check={selectedOption === 'Option 2'}
        onChange={handleChange}
      />
      <RadioButton
        id="option3"
        label="Option 3"
        check={selectedOption === 'Option 3'}
        onChange={handleChange}
      />
    </div>
  );
}

export default RadioButtonGroup;
