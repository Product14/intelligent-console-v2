'use client';

import React, { useEffect, useState } from 'react';
import { usePopper } from 'react-popper';

import { coachMarksTypography, showProgress } from './config';

const SidebarInventoryCoachMark = (props) => {
  const [popperElement, setPopperElement] = useState(null);
  const { styles, attributes } = usePopper(
    props.inventoryRef.current,
    popperElement,
    {
      placement: 'right',
      strategy: 'fixed',
    }
  );

  return (
    <div
      className="inventory-coach-mark-step2 !left-[16rem] !top-[13rem]"
      ref={setPopperElement}
      style={styles.popper}
      {...attributes.popper}
    >
      <div className="mb-3 flex flex-col gap-2">
        <h4 className="text-xl font-semibold text-white">
          {coachMarksTypography[props.category_id]?.step_2_heading}
        </h4>
        <p className="text-white-70 text-sm font-normal">
          {coachMarksTypography[props.category_id]?.step_2_subheading}
        </p>
      </div>
    </div>
  );
};

export default SidebarInventoryCoachMark;
