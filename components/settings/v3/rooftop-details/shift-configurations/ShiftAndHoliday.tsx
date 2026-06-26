'use client';

import {
  RequestPayloadAvailabilityHours,
  RequestPayloadHoliday,
} from '@/types/settings/vini-config';

import { useMemo, useRef, useState } from 'react';
import { IoMdAdd } from 'react-icons/io';
import { IoCheckmark } from 'react-icons/io5';
import { MdEdit } from 'react-icons/md';

import {
  HolidayData as HolidayFormData,
  HolidaySettingModal,
} from './HolidaySettingModal';
import { PreviewHolidayItem } from './PreviewHolidayItem';
import WorkingHours from './RooftopWorkingHours';
import { WorkingHoursModal } from './RooftopWorkingHours';
import { ShiftSummary } from './ShiftSummary';

// UI-specific holiday type that includes an ID for managing the list
interface UIHoliday extends RequestPayloadHoliday {
  id: string;
}

// Helper to convert HolidayFormData to UIHoliday
const convertFormDataToUIHoliday = (formData: HolidayFormData): UIHoliday => {
  return {
    id: formData.id || Date.now().toString(),
    name: formData.festivalName || 'Custom Holiday',
    reason: formData.reason,
    date: formData.date,
    isClosed: formData.isFullDay,
    startTime: formData.startTime
      ? `${formData.startTime.hour}:${formData.startTime.minute}`
      : undefined,
    endTime: formData.endTime
      ? `${formData.endTime.hour}:${formData.endTime.minute}`
      : undefined,
  };
};

// Helper to convert UIHoliday to HolidayFormData
const convertUIHolidayToFormData = (uiHoliday: UIHoliday): HolidayFormData => {
  return {
    id: uiHoliday.id,
    festivalName: uiHoliday.name,
    reason: uiHoliday.reason,
    date: uiHoliday.date,
    isFullDay: uiHoliday.isClosed,
    startTime: uiHoliday.startTime
      ? {
          hour: uiHoliday.startTime.split(':')[0],
          minute: uiHoliday.startTime.split(':')[1],
          period: 'AM',
        }
      : undefined,
    endTime: uiHoliday.endTime
      ? {
          hour: uiHoliday.endTime.split(':')[0],
          minute: uiHoliday.endTime.split(':')[1],
          period: 'AM',
        }
      : undefined,
  };
};

interface ShiftAndHolidayProps {
  category: 'sales' | 'service' | 'parts' | 'finance';
  hasHolidayTracker?: boolean;
  operatingHours: RequestPayloadAvailabilityHours;
  updateOperatingHours: (hours: RequestPayloadAvailabilityHours) => void;
  isSameAsParent?: boolean;
  onToggleSameAsParent?: () => void;
  holidays?: RequestPayloadHoliday[];
  updateHolidays?: (holidays: RequestPayloadHoliday[]) => void;
  isSameAsParentHoliday?: boolean;
  onToggleSameAsParentHoliday?: () => void;
}

export default function ShiftAndHoliday({
  category,
  hasHolidayTracker = true,
  operatingHours,
  updateOperatingHours,
  isSameAsParent = false,
  onToggleSameAsParent,
  holidays: holidaysProp,
  updateHolidays,
  isSameAsParentHoliday = false,
  onToggleSameAsParentHoliday,
}: ShiftAndHolidayProps) {
  const [isWorkingShiftModalOpen, setIsWorkingShiftModalOpen] = useState(false);
  const [tempOperatingHours, setTempOperatingHours] = useState<any>(null);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [localHolidays, setLocalHolidays] = useState<UIHoliday[]>([]);
  const [editingHoliday, setEditingHoliday] = useState<HolidayFormData | null>(
    null
  );
  const workingShiftContentRef = useRef<HTMLButtonElement>(null);
  const holidayContentRef = useRef<HTMLButtonElement>(null);

  // Convert prop holidays to UI holidays by adding IDs
  const uiHolidays: UIHoliday[] = useMemo(() => {
    if (holidaysProp) {
      return holidaysProp.map((h, index) => ({
        ...h,
        id: `${h.name}-${h.date}-${index}`,
      }));
    }
    return localHolidays;
  }, [holidaysProp, localHolidays]);

  // Handler to update holidays (converts UIHoliday back to RequestPayloadHoliday)
  const setHolidays = (
    updater: UIHoliday[] | ((prev: UIHoliday[]) => UIHoliday[])
  ) => {
    if (updateHolidays) {
      const newHolidays =
        typeof updater === 'function' ? updater(uiHolidays) : updater;
      // Remove id field before sending to parent
      const apiHolidays: RequestPayloadHoliday[] = newHolidays.map(
        ({ id, ...rest }) => rest
      );
      updateHolidays(apiHolidays);
    } else {
      if (typeof updater === 'function') {
        setLocalHolidays(updater);
      } else {
        setLocalHolidays(updater);
      }
    }
  };

  const holidays = useMemo(() => uiHolidays, [uiHolidays]);

  const handleOpenWorkingShiftModal = () => {
    setTempOperatingHours(operatingHours);
    setIsWorkingShiftModalOpen(true);
  };

  const handleCloseWorkingShiftModal = () => {
    setIsWorkingShiftModalOpen(false);
    setTempOperatingHours(null);
  };

  const handleConfirmWorkingShift = () => {
    if (tempOperatingHours) {
      updateOperatingHours(tempOperatingHours);
    }
    setIsWorkingShiftModalOpen(false);
    setTempOperatingHours(null);
  };

  const handleAddHoliday = () => {
    setEditingHoliday(null);
    setIsHolidayModalOpen(true);
  };

  const handleDeleteHoliday = (holidayId: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== holidayId));
  };

  const handleSaveHoliday = (holiday: HolidayFormData) => {
    const uiHoliday = convertFormDataToUIHoliday(holiday);
    if (holiday.id) {
      // Editing existing holiday
      setHolidays((prev) =>
        prev.map((h) => (h.id === holiday.id ? uiHoliday : h))
      );
    } else {
      // Adding new holiday - remove any existing holiday with the same date
      setHolidays((prev) => {
        const filtered = prev.filter((h) => h.date !== uiHoliday.date);
        return [...filtered, uiHoliday];
      });
    }
    setIsHolidayModalOpen(false);
    setEditingHoliday(null);
  };

  const handleSaveBatchHolidays = (holidaysToSave: HolidayFormData[]) => {
    const newUIHolidays = holidaysToSave.map(convertFormDataToUIHoliday);

    // Deduplicate: keep only one holiday per date
    // Newer holidays (from holidaysToSave) will replace older ones with the same date
    setHolidays((prev) => {
      const combined = [...prev, ...newUIHolidays];

      // Create a map with date as key, keeping the last occurrence (newest)
      const uniqueByDate = new Map<string, UIHoliday>();
      combined.forEach((holiday) => {
        uniqueByDate.set(holiday.date, holiday);
      });

      return Array.from(uniqueByDate.values());
    });

    setIsHolidayModalOpen(false);
    setEditingHoliday(null);
  };

  const parentCategory = useMemo(() => {
    if (category === 'parts') return 'service';
    if (category === 'finance') return 'sales';
    if (category === 'service') return 'sales';
    return category;
  }, [category]);

  const getDepartmentLabel = (cat: string) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const handleToggleSameAsParent = () => {
    const wasChecked = isSameAsParent;
    onToggleSameAsParent?.();

    // Scroll to content when unchecking
    if (wasChecked) {
      setTimeout(() => {
        if (workingShiftContentRef.current) {
          workingShiftContentRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      }, 100);
    }
  };

  const handleToggleSameAsParentHoliday = () => {
    const wasChecked = isSameAsParentHoliday;
    onToggleSameAsParentHoliday?.();

    // Scroll to content when unchecking
    if (wasChecked) {
      setTimeout(() => {
        if (holidayContentRef.current) {
          holidayContentRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      }, 100);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full flex-col gap-2">
        <span className="text-sm font-medium leading-5 text-[#666666]">
          {getDepartmentLabel(category)} Department Working Shift
        </span>

        <div className="flex flex-col gap-3">
          {category !== 'sales' && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleSameAsParent}
                className="flex items-center gap-3"
              >
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded ${
                    isSameAsParent
                      ? 'bg-[#4600f2]'
                      : 'border border-[#e6e6e6] bg-white'
                  }`}
                >
                  {isSameAsParent && (
                    <IoCheckmark className="h-4 w-4 font-medium text-white" />
                  )}
                </div>
              </button>
              <span className="text-sm font-semibold leading-5 text-[#111]">
                Same as {getDepartmentLabel(parentCategory)}
              </span>
            </div>
          )}

          {(category === 'sales' || !isSameAsParent) && (
            <button
              ref={workingShiftContentRef}
              type="button"
              onClick={handleOpenWorkingShiftModal}
              className="flex w-fit items-center gap-2 rounded-lg border border-[#111] bg-white px-3 py-2 shadow-sm"
            >
              <MdEdit className="h-5 w-5 text-[#111]" />
              <span className="text-sm font-semibold leading-5 text-[#111]">
                Edit
              </span>
            </button>
          )}
        </div>

        {(category === 'sales' || !isSameAsParent) && (
          <ShiftSummary
            schedule={operatingHours}
            holidaysCount={holidays.length}
            className="mt-1"
          />
        )}

        {hasHolidayTracker && (
          <div className="mt-2 flex w-full flex-col gap-2">
            <span className="text-sm font-medium leading-5 text-[#666666]">
              {getDepartmentLabel(category)} Department Holiday Tracker
            </span>

            <div className="flex flex-col gap-3">
              {category !== 'sales' && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleSameAsParentHoliday}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded ${
                        isSameAsParentHoliday
                          ? 'bg-[#4600f2]'
                          : 'border border-[#e6e6e6] bg-white'
                      }`}
                    >
                      {isSameAsParentHoliday && (
                        <IoCheckmark className="h-4 w-4 font-medium text-white" />
                      )}
                    </div>
                  </button>
                  <span className="text-sm font-semibold leading-5 text-[#111]">
                    Same as {getDepartmentLabel(parentCategory)}
                  </span>
                </div>
              )}

              {(category === 'sales' || !isSameAsParentHoliday) && (
                <>
                  {!holidays.length ? (
                    <button
                      ref={holidayContentRef}
                      type="button"
                      onClick={handleAddHoliday}
                      className="flex w-fit items-center gap-2 rounded-lg border border-[#111] bg-white px-6 py-2 shadow-sm"
                    >
                      <IoMdAdd className="h-6 w-6" />
                      <span className="text-sm font-semibold leading-5">
                        Add Holiday
                      </span>
                    </button>
                  ) : (
                    <>
                      <button
                        ref={holidayContentRef}
                        type="button"
                        onClick={handleAddHoliday}
                        className="flex w-fit items-center gap-2 rounded-lg border border-[#111] bg-white px-6 py-2 shadow-sm"
                      >
                        <IoMdAdd className="h-6 w-6" />
                        <span className="text-sm font-semibold leading-5">
                          Add Holiday
                        </span>
                      </button>
                      <div className="inline-flex flex-col items-center justify-start gap-2 rounded-xl border border-black/20 bg-white px-6 py-4">
                        {holidays.map((holiday) => (
                          <PreviewHolidayItem
                            key={holiday.id}
                            holiday={convertUIHolidayToFormData(holiday)}
                            onRemove={handleDeleteHoliday}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <WorkingHoursModal
        isOpen={isWorkingShiftModalOpen}
        onClose={handleCloseWorkingShiftModal}
        onConfirm={handleConfirmWorkingShift}
        operatingHours={tempOperatingHours}
        updateOperatingHours={setTempOperatingHours}
        readOnly={false}
      />

      <HolidaySettingModal
        category={category}
        isOpen={isHolidayModalOpen}
        onClose={() => {
          setIsHolidayModalOpen(false);
          setEditingHoliday(null);
        }}
        onSave={handleSaveHoliday}
        onSaveBatch={handleSaveBatchHolidays}
        initialData={editingHoliday}
        operatingHours={operatingHours}
        existingHolidays={holidays.map(convertUIHolidayToFormData)}
      />
    </div>
  );
}
