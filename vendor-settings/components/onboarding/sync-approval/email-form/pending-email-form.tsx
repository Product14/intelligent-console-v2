import React from 'react';
import { CiCircleInfo } from 'react-icons/ci';

import SpyneLogo from '@spyne-console/design-system/logo/spyne-logo';

import StepWrapper from '../../integrations/step-wrapper';
import type { EmailFormData } from '../types';
import { plainTextToHtml } from '../utils/plain-text-to-html';
import type { FormErrors } from './email-approval-form';

// Shared email input field component
interface EmailInputFieldProps {
  id: string;
  type?: 'email' | 'text';
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder: string;
  error?: string;
  touched?: boolean;
}

const EmailInputField: React.FC<EmailInputFieldProps> = ({
  id,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  touched,
}) => (
  <div className="flex flex-col">
    <div
      className={`border-b py-2.5 ${touched && error ? 'border-red-500' : 'border-gray-200'}`}
    >
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full bg-transparent py-0.5 text-sm outline-none placeholder:text-black/40"
      />
    </div>
    {touched && error && (
      <div className="mt-1 flex items-center gap-1">
        <CiCircleInfo className="h-3 w-3 text-red-500" />
        <span className="text-[10px] font-medium text-red-500">{error}</span>
      </div>
    )}
  </div>
);

// Email Preview component
interface EmailPreviewProps {
  formData: EmailFormData;
  formattedDate: string;
  partnerName: string;
}

const EmailPreview: React.FC<EmailPreviewProps> = ({
  formData,
  formattedDate,
  partnerName,
}) => (
  <div className="m-4 ml-0 flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-gray-300 shadow-sm">
    <img
      src="https://spyne-static.s3.us-east-1.amazonaws.com/Chrome+Toolbar.svg"
      alt="Browser toolbar"
      className="h-auto w-full shrink-0"
    />

    <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-white px-5 py-4">
      <p className="mb-3 text-xs font-medium tracking-wide text-black/40">
        EMAIL CONTENT PREVIEW
      </p>

      {/* Subject */}
      <h2 className="mb-4 break-words text-xl font-semibold text-black">
        {formData.subject || 'Subject'}
      </h2>

      {/* Sender Info */}
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
          <SpyneLogo className="h-8 w-8" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-black">Spyne.ai</span>
              <span className="ml-1 text-sm text-black/50">
                &lt;support@spyne.ai&gt;
              </span>
            </div>
            <span className="flex-shrink-0 text-xs text-black/50">
              {formattedDate}
            </span>
          </div>

          <div className="mt-1.5 flex min-w-0 items-center text-sm">
            <span className="flex-shrink-0 text-black/50">To:</span>
            <span className="ml-2 truncate rounded-full bg-gray-100 px-2.5 py-1 text-xs text-black/70">
              {formData.toEmail || 'IMS email'}
            </span>
          </div>

          <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1 text-sm">
            <span className="flex-shrink-0 text-black/50">cc:</span>
            <span className="ml-1 max-w-[45%] truncate rounded-full bg-gray-100 px-2.5 py-1 text-xs text-black/70">
              {formData.ccDealershipEmail || 'Dealership Email*:'}
            </span>
            <span className="max-w-[45%] truncate rounded-full bg-gray-100 px-2.5 py-1 text-xs text-black/70">
              {formData.ccSpynePoc || 'Spyne POC Email'}
            </span>
          </div>
        </div>
      </div>

      {/* Email Body */}
      <div className="break-words text-sm leading-relaxed text-black/80">
        {formData.message ? (
          <div
            className="max-h-full min-h-[80px] break-words rounded-lg bg-[#f5f7f9] p-4 text-sm text-black/70 [&_p:last-child]:mb-0 [&_p]:mb-2"
            dangerouslySetInnerHTML={{
              __html: plainTextToHtml(formData.message),
            }}
          />
        ) : (
          <div className="max-h-full min-h-[80px] rounded-lg bg-[#f5f7f9] p-4 text-sm text-black/40">
            YOUR MESSAGE HERE...
          </div>
        )}
      </div>
    </div>
  </div>
);

// Pending state component - Email Form
export interface PendingEmailFormProps {
  title: string;
  subtitle: string;
  partnerName: string;
  formData: EmailFormData;
  errors: FormErrors;
  touched: Record<string, boolean>;
  isFormValid: boolean;
  isSubmitting: boolean;
  /** Whether the partner email is still being fetched */
  partnerEmailLoading?: boolean;
  formattedDate: string;
  onUpdateField: (field: keyof EmailFormData, value: string) => void;
  onBlur: (field: keyof EmailFormData) => void;
  onSendEmail: () => void;
  onboardingStartTime?: string | number | null;
}

const PendingEmailForm: React.FC<PendingEmailFormProps> = ({
  title,
  subtitle,
  partnerName,
  formData,
  errors,
  touched,
  isFormValid,
  isSubmitting,
  partnerEmailLoading = false,
  formattedDate,
  onUpdateField,
  onBlur,
  onSendEmail,
  onboardingStartTime,
}) => (
  <StepWrapper
    title={title}
    subtitle={subtitle}
    onNext={onSendEmail}
    nextLabel={isSubmitting ? 'Sending...' : 'Send'}
    isLastStep={false}
    isNextDisabled={!isFormValid || isSubmitting}
    onboardingStartTime={onboardingStartTime}
  >
    <div className="my-3 flex h-full flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Left - Form */}
      <div className="w-[380px] flex-shrink-0 border-gray-200 px-5 py-3">
        <div className="flex h-full flex-col">
          <EmailInputField
            id="toEmail"
            type="email"
            value={partnerEmailLoading ? '' : formData.toEmail}
            onChange={(value) => onUpdateField('toEmail', value)}
            onBlur={() => onBlur('toEmail')}
            placeholder={
              partnerEmailLoading ? 'Fetching IMS email...' : 'To (IMS Email)*:'
            }
            error={errors.toEmail}
            touched={touched.toEmail}
          />
          <EmailInputField
            id="ccSpynePoc"
            type="email"
            value={formData.ccSpynePoc}
            onChange={(value) => onUpdateField('ccSpynePoc', value)}
            onBlur={() => onBlur('ccSpynePoc')}
            placeholder="CC (Spyne POC Email)*:"
            error={errors.ccSpynePoc}
            touched={touched.ccSpynePoc}
          />
          <EmailInputField
            id="ccDealershipEmail"
            type="email"
            value={formData.ccDealershipEmail}
            onChange={(value) => onUpdateField('ccDealershipEmail', value)}
            onBlur={() => onBlur('ccDealershipEmail')}
            placeholder="CC (Dealership Email)*:"
            error={errors.ccDealershipEmail}
            touched={touched.ccDealershipEmail}
          />
          <div className="border-b border-gray-200 py-2.5">
            <input
              id="dealerId"
              type="text"
              value={formData.dealerId}
              onChange={(e) => onUpdateField('dealerId', e.target.value)}
              placeholder="Dealer ID:"
              className="w-full bg-transparent py-0.5 text-sm outline-none placeholder:text-black/40"
            />
          </div>
          <div className="border-b border-gray-200 py-2.5">
            <input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => onUpdateField('subject', e.target.value)}
              placeholder="Subject:"
              className="w-full bg-transparent py-0.5 text-sm outline-none placeholder:text-black/40"
            />
          </div>
          <div className="flex-1 pt-3">
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => onUpdateField('message', e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              className="h-full w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none placeholder:text-black/40 focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Right - Email Preview */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <EmailPreview
          formData={formData}
          formattedDate={formattedDate}
          partnerName={partnerName}
        />
      </div>
    </div>
  </StepWrapper>
);

export default PendingEmailForm;
