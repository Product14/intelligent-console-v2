import { useEffect, useState } from 'react';

import axios from 'axios';

import { useQueryParams } from '@spyne-console/hooks';

import SVG from '../svg/SVG';

const SendMessage = ({
  isOpen,
  onClose,
  setModalType,
  from,
  isIframe = false,
}) => {
  if (!isOpen) return null;
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [defaultBearerToken, setDefaultBearerToken] = useState('');
  const { queryParams } = useQueryParams();
  let { enterprise_id, team_id, bearer_token, user_name, user_email, source } =
    queryParams;

  if (team_id?.[0] === '[') {
    team_id = team_id.slice(1, -1);
  }

  const [submitting, setSubmitting] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(false);
  const [error, setError] = useState({
    subject: '',
    description: '',
    file: '',
    createError: '',
  });

  const handleSubmit = async () => {
    let updatedError = {};

    if (!subject) {
      updatedError.subject = 'Subject is required';
    } else if (subject.trim() === '') {
      updatedError.subject = 'Subject cannot be only spaces';
    } else if (subject.length > 255) {
      updatedError.subject = 'Subject cannot exceed 255 characters';
    }

    if (!description) {
      updatedError.description = 'Description is required';
    } else if (description.trim() === '') {
      updatedError.description = 'Description cannot be only spaces';
    } else if (description.length > 5000) {
      updatedError.description = 'Description cannot exceed 5000 characters';
    }

    setError(updatedError);
    if (Object.keys(updatedError).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('description', description);
      formData.append('email', userDetails.emailId);
      formData.append('enterpriseId', enterprise_id);
      formData.append('name', userDetails.name);
      formData.append('teamId', team_id);
      formData.append('source', source || '');
      if (files.length > 0) {
        files.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      //not using centralapi handler here since files is being sent
      await axios.post(
        `${process.env.NEXT_PUBLIC_CONSOLE_BACKEND_SERVICE_URL}/v1/freshdesk/create-freshdesk-ticket`,
        formData,
        {
          headers: {
            authorization: defaultBearerToken,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setTicketCreated(true);
    } catch (error) {
      setError({
        createError: `Failed to create ticket : Internal Server Error`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onFileChange = (e) => {
    const newSelected = Array.from(e.target.files);
    const selectedFiles = [...files, ...newSelected];
    const maxTotalSize = 20 * 1024 * 1024; // 20MB
    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > maxTotalSize) {
      alert(
        'Total file size exceeds 20MB limit. Please select smaller files or fewer files.'
      );
      return;
    }
    setFiles(selectedFiles);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserDetails = localStorage.getItem('userDetails');
      const storedToken = localStorage.getItem('defaultBearerToken');
      setUserDetails(JSON.parse(storedUserDetails || '{}'));
      setDefaultBearerToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (isIframe && bearer_token && user_name && user_email) {
      setDefaultBearerToken(bearer_token);
      setUserDetails({ name: user_name, emailId: user_email });
    }
  }, [isIframe, bearer_token, user_name, user_email]);

  return (
    <div className={`${isIframe ? 'flex h-full flex-col' : ''}`}>
      <div className="flex items-center justify-between border-b p-5">
        <div className="flex items-center gap-3">
          <SVG
            iconName="chevron"
            rotate={90}
            className="h-5 w-5 cursor-pointer text-black/80"
            onClick={() => setModalType(from)}
          />
          <span className="text-xl font-semibold leading-7 text-black/80">
            Message
          </span>
        </div>
        <SVG
          iconName="crossIcon"
          className="cursor-pointer"
          onClick={onClose}
        />
      </div>
      {ticketCreated ? (
        <div className="flex min-h-[66vh] flex-col items-center justify-between p-5">
          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full border-[8px] border-[#ECFDF3] bg-[#D1FADF] p-2">
              <SVG iconName="GreenTick" className="z-10" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-center text-lg font-semibold leading-7 text-black/90">
                Message Sent
              </span>
              <span className="text-center text-sm font-normal leading-tight text-black/60">
                Your message has been received. We will get back to you shortly.
              </span>
            </div>
          </div>
          <span className="text-center text-sm font-normal leading-tight text-black/40">
            Thank you for helping us improve Spyne!
          </span>
        </div>
      ) : (
        <div
          className={`flex ${isIframe ? 'flex-1' : 'min-h-[66vh]'} flex-col justify-between p-5`}
        >
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-normal leading-tight text-black/80">
                Subject*
              </span>
              <input
                className="rounded-lg border border-[#E5E5E5] px-3 py-4 text-sm focus:border-black"
                placeholder="Give a short subject"
                value={subject}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 255) {
                    setSubject(value);
                  }
                }}
              />
              <div className="flex items-center justify-between">
                {error.subject && (
                  <span className="text-[10px] font-normal leading-tight text-red-500">
                    {error.subject}
                  </span>
                )}
                <span className="ml-auto text-[10px] font-normal leading-tight text-black/40">
                  {subject.length}/255
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-normal leading-tight text-black/80">
                Description*
              </span>
              <textarea
                className="resize-none overflow-y-auto rounded-lg border border-[#E5E5E5] px-3 py-4 text-sm focus:border-black"
                placeholder="Describe your issue in detail."
                value={description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 5000) {
                    setDescription(value);
                  }
                }}
                rows={5}
              />
              <div className="flex items-center justify-between">
                {error.description && (
                  <span className="text-[10px] font-normal leading-tight text-red-500">
                    {error.description}
                  </span>
                )}
                <span className="ml-auto text-[10px] font-normal leading-tight text-black/40">
                  {description.length}/5000
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-normal leading-tight text-black/80">
                Attach File
              </span>
              <button
                className="flex w-fit items-center gap-2 rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm"
                onClick={() =>
                  document.getElementById('help-modal-file-input').click()
                }
              >
                <SVG iconName="UploadIcon" fill="#666666" className="h-4 w-4" />
                <span className="text-sm font-medium leading-tight text-black/80">
                  Upload
                </span>
              </button>
              {files.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="justify-start text-[10px] font-normal text-black/80">
                    {files?.length} File{files.length > 1 ? 's' : ''} attached
                  </span>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm"
                    >
                      <SVG
                        iconName="FileIcon"
                        fill="#666666"
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-medium leading-tight text-black/80">
                        {file.name?.length > 20
                          ? file.name?.substring(0, 20) + '...'
                          : file.name}
                      </span>
                      <button
                        onClick={() =>
                          setFiles(files.filter((_, i) => i !== index))
                        }
                        className="ml-auto"
                      >
                        <SVG iconName="crossIcon" className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                className="hidden rounded-lg border-[#E5E5E5] pl-1 text-sm"
                type="file"
                id="help-modal-file-input"
                multiple
                onChange={onFileChange}
                accept="image/*,.pdf,.doc,.docx,.txt,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv"
              />
              {error.file && (
                <span className="text-[10px] font-normal leading-tight text-red-500">
                  {error.file}
                </span>
              )}
            </div>
          </div>
          {error.createError && (
            <span className="text-[10px] font-normal leading-tight text-red-500">
              {error.createError}
            </span>
          )}
          <button
            className={`flex w-full items-center justify-between rounded-xl bg-[#4600F2] px-6 py-4 ${
              submitting ? 'opacity-50' : ''
            }`}
            onClick={handleSubmit}
            disabled={submitting}
          >
            <span className="text-base font-normal leading-tight text-white">
              {submitting ? 'Sending...' : 'Send a Message'}
            </span>
            <SVG iconName="Send" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SendMessage;
