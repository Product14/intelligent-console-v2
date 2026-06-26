import React, { useEffect, useMemo, useState } from 'react';

import type { ApprovalStatus, EmailFormData } from '../types';
import ApprovalStatusScreen, { SkippedScreen } from './approval-status-screen';
import PendingEmailForm from './pending-email-form';

export interface FormErrors {
  toEmail: string;
  ccSpynePoc: string;
  ccDealershipEmail: string;
  dealerId: string;
  subject: string;
}

// Re-export types for backward compatibility
export type { EmailFormData, ApprovalStatus };

export interface EmailApprovalFormProps {
  title: string;
  subtitle: string;
  partnerName?: string;
  initialValues?: Partial<EmailFormData>;
  currentStatus: ApprovalStatus;
  isScheduled?: boolean;
  scheduledReminderTime?: { start: string; end: string } | null;
  /** Whether the partner email is still being fetched */
  partnerEmailLoading?: boolean;
  onSendEmail: (formData: EmailFormData) => void | Promise<void>;
  onApprove: () => void | Promise<void>;
  onConfirm: () => void;
  onBack: () => void;
}

const EmailApprovalForm: React.FC<EmailApprovalFormProps> = ({
  title,
  subtitle,
  partnerName = 'IMS Provider',
  initialValues,
  currentStatus,
  isScheduled = false,
  scheduledReminderTime = null,
  partnerEmailLoading = false,
  onSendEmail,
  onApprove,
  onConfirm,
  onBack,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EmailFormData>({
    toEmail: initialValues?.toEmail ?? '',
    ccSpynePoc: initialValues?.ccSpynePoc ?? '',
    ccDealershipEmail: initialValues?.ccDealershipEmail ?? '',
    dealerId: initialValues?.dealerId ?? '',
    subject: initialValues?.subject ?? '',
    message: initialValues?.message ?? '',
  });

  // Update toEmail when partner email is fetched asynchronously
  useEffect(() => {
    if (initialValues?.toEmail) {
      setFormData((prev) => ({ ...prev, toEmail: initialValues.toEmail! }));
    }
  }, [initialValues?.toEmail]);
  const [errors, setErrors] = useState<FormErrors>({
    toEmail: '',
    ccSpynePoc: '',
    ccDealershipEmail: '',
    dealerId: '',
    subject: '',
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateEmail = (email: string): string => {
    if (!email.trim()) return 'This field is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const updateField = (field: keyof EmailFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (
      field === 'toEmail' ||
      field === 'ccSpynePoc' ||
      field === 'ccDealershipEmail'
    ) {
      setErrors((prev) => ({ ...prev, [field]: validateEmail(value) }));
    }
  };

  const handleBlur = (field: keyof EmailFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (
      field === 'toEmail' ||
      field === 'ccSpynePoc' ||
      field === 'ccDealershipEmail'
    ) {
      setErrors((prev) => ({
        ...prev,
        [field]: validateEmail(formData[field]),
      }));
    }
  };

  const isFormValid = useMemo(() => {
    const toEmailValid =
      formData.toEmail.trim() !== '' && !validateEmail(formData.toEmail);
    const ccSpynePocValid =
      formData.ccSpynePoc.trim() !== '' && !validateEmail(formData.ccSpynePoc);
    const ccDealershipEmailValid =
      formData.ccDealershipEmail.trim() !== '' &&
      !validateEmail(formData.ccDealershipEmail);
    return toEmailValid && ccSpynePocValid && ccDealershipEmailValid;
  }, [formData.toEmail, formData.ccSpynePoc, formData.ccDealershipEmail]);

  const handleSendEmail = async () => {
    if (!isFormValid) return;
    setIsSubmitting(true);
    try {
      await onSendEmail(formData);
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove();
    } catch (error) {
      console.error('Error approving:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  const reminderTime = useMemo(() => {
    if (scheduledReminderTime) return scheduledReminderTime;
    const now = new Date();
    const reminderStart = new Date(now.getTime() + 60 * 60 * 1000);
    const reminderEnd = new Date(reminderStart.getTime() + 15 * 60 * 1000);
    const formatTime = (date: Date) =>
      date
        .toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
        .toLowerCase();
    return { start: formatTime(reminderStart), end: formatTime(reminderEnd) };
  }, [scheduledReminderTime]);

  // Render based on current status
  if (currentStatus === 'pending') {
    return (
      <PendingEmailForm
        title={title}
        subtitle={subtitle}
        partnerName={partnerName}
        formData={formData}
        errors={errors}
        touched={touched}
        isFormValid={isFormValid}
        isSubmitting={isSubmitting}
        partnerEmailLoading={partnerEmailLoading}
        formattedDate={formattedDate}
        onUpdateField={updateField}
        onBlur={handleBlur}
        onSendEmail={handleSendEmail}
      />
    );
  }

  if (currentStatus === 'mail sent' || currentStatus === 'approved') {
    return (
      <ApprovalStatusScreen
        title={title}
        subtitle={subtitle}
        partnerName={partnerName}
        isApproved={currentStatus === 'approved'}
        isScheduled={isScheduled}
        isSubmitting={isSubmitting}
        reminderTime={reminderTime}
        onApprove={handleApprove}
        onConfirm={onConfirm}
      />
    );
  }

  return <SkippedScreen onBack={onBack} />;
};

export default EmailApprovalForm;
