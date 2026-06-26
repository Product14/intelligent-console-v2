import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import styles from './accordian.module.css';

export default function Accordian(props) {
  const [accordianBodyHeight, setAccordianBodyHeight] = useState(
    props.setInitialOpen
      ? props?.maxHeight
        ? props?.maxHeight
        : '50vh'
      : '0px'
  );

  const accordianContent = useRef(null);

  const toggleAccordian = (index) => {
    if (props.handleMultiple) props.setActiveIcon(index);
    else if (props.activeIcon !== index) props.setActiveIcon(index);
    else props.setActiveIcon(-1);
  };

  useEffect(() => {
    const accordionHeight = props.vinAccordian
      ? '18vh'
      : props?.maxHeight
        ? props?.maxHeight
        : '50vh';
    setAccordianBodyHeight(
      props.activeIcon === props.idx ? accordionHeight : '0px'
    );
  }, [props.activeIcon, props.vinAccordian]);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(props.title);

  const inputRef = useRef(null);

  // Sync local state when props.title changes
  useEffect(() => {
    if (!isEditing) {
      setTitle(props.title);
    }
  }, [props.title, isEditing]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleTitleChange = (e) => {
    const value = e.target.value.toUpperCase();
    if (/^[A-Z0-9]*$/.test(value) && value.length <= 17) {
      setTitle(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (title.trim() === '') {
        alert('The folder name cannot be empty.');
        setTitle(props.title);
      } else {
        setIsEditing(false);
        props.onTitleChange(title);
      }
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setTitle(props.title);
    }
  };

  return (
    <div className={props.class1 || 'accordian-section block w-full'}>
      <button
        className={
          props.class2 ||
          'accordian-btn bg-gray-light text-black-light mb-3 flex w-full justify-between gap-1 rounded-t-lg border-0 px-3 py-2 text-xs font-medium leading-[15px] outline-none'
        }
        onClick={() => toggleAccordian(props.idx)}
      >
        <div className="flex items-center gap-4">
          {isEditing ? (
            <input
              ref={inputRef}
              className="bg-fade-yellow text-reddish-orange flex-1 text-sm font-semibold leading-tight"
              value={title}
              onChange={handleTitleChange}
              onKeyDown={handleKeyDown}
              onBlur={() => setIsEditing(false)}
            />
          ) : (
            <p
              className={
                props.class3 ||
                [
                  styles[
                    props.activeIcon === props.idx
                      ? 'accordian-title-active'
                      : 'accordian-title'
                  ],
                  'float-left',
                ].join(' ')
              }
            >
              {props.title}
            </p>
          )}
          {props?.noVinsFoundEdit && (
            <Image
              src="https://spyne-static.s3.amazonaws.com/console/inventory/edit_icon_active.svg"
              alt="edit-vehicle-name"
              width={16}
              height={16}
              className="cursor-pointer"
              onClick={handleEditClick}
            />
          )}
          {props?.noVinsFoundEdit && (
            <Image
              src="https://spyne-static.s3.amazonaws.com/console/inventory/delete_bin_active.svg"
              alt="delete-vehicle-name"
              width={16}
              height={16}
              className="cursor-pointer"
              onClick={() => props.deleteFolder(props.id)}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {props?.vinAccordian && (
            <h4 className="text-blue-darker text-sm font-normal">
              {props?.subHeading}
            </h4>
          )}
          <Image
            src="https://spyne-static.s3.amazonaws.com/console/filter/chevron_down_inactive.svg"
            width={20}
            height={20}
            alt="dropdown-icon"
            className={[
              styles[
                props.activeIcon === props.idx
                  ? 'rotate-icon'
                  : 'accordian-icon'
              ],
              `ml-auto ${props.classArrow}`,
            ].join(' ')}
          />
        </div>
      </button>
      <div
        ref={accordianContent}
        style={{ maxHeight: `${accordianBodyHeight}` }}
        className="scrollbar max-h-[50vh] overflow-hidden overflow-y-scroll transition-all duration-500 ease-in-out"
      >
        {/* <div className={styles['accordian-text']} dangerouslySetInnerHTML={{ __html: props.content }} ></div> */}

        {props.class1 ? (
          <div className={props.class4}>
            {typeof props.content === 'string' ? (
              props.content.match('\n') ? (
                props.content.split('\n').map((line, index) => {
                  return <div key={index}>{line}</div>;
                })
              ) : props.content.match('connect@spyne.ai') ? (
                props.content.split('connect@spyne.ai').map((eml, idx) => {
                  return (
                    <React.Fragment key={idx}>
                      {eml}
                      {idx <
                        props.content.split('connect@spyne.ai').length - 1 && (
                        <a
                          className="text-blue-light"
                          target="_blank"
                          href="mailto:connect@spyne.ai"
                        >
                          connect@spyne.ai
                        </a>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                props.content
              )
            ) : (
              <div>{props.content}</div>
            )}
          </div>
        ) : (
          <div>{props.content}</div>
        )}
      </div>
    </div>
  );
}
