'use client';

import { DepartmentsForm } from '@/components/settings/rooftop/departments-form';

export default function DepartmentDetailsPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-black-dark">Department Details</h1>
        <p className="mt-1 text-sm text-black-60">
          Contact info, address, and working hours for each department. Vini
          answers calls based on these hours.
        </p>
      </header>
      <DepartmentsForm subStepId="departments" />
    </div>
  );
}
