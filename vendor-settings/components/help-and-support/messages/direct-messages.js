import { Tooltip } from '@spyne-console/design-system';

import { useEffect, useRef, useState } from 'react';

import axios from 'axios';

import { useQueryParams } from '@spyne-console/hooks';

import CentralAPIHandler from '../../../../utils/src/centralAPIHandler/centralAPIHandler';
import SVG from '../../svg/SVG';
import { formatDate } from '../utils';

//didn't use external library for markdown since wanted lot of customizations
// Helper function to parse markdown-style formatting
const parseMessageFormatting = (text) => {
  if (!text) return '';

  // Convert **text** to <strong>text</strong>
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert *text* to <em>text</em> (italic)
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Convert `text` to <code>text</code> (inline code)
  formattedText = formattedText.replace(
    /`(.*?)`/g,
    '<code class="bg-gray-200 px-1 py-0.5 rounded text-xs">$1</code>'
  );

  return formattedText;
};

const DirectMessages = ({
  isOpen,
  onClose,
  setModalType,
  selectedTicket,
  setSelectedTicket,
  isIframe = false,
}) => {
  const [conversations, setConversations] = useState([]);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [initialFetch, setInitialFetch] = useState(true);
  const [loading, setLoading] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const messagesEndRef = useRef(null);
  const [defaultBearerToken, setDefaultBearerToken] = useState('');
  const { queryParams } = useQueryParams();
  let { bearer_token } = queryParams;

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'instant',
        block: 'end',
      });
    }
  };

  const onFileChange = (e) => {
    const newSelected = Array.from(e.target.files);
    const selectedFiles = [...files, ...newSelected];
    const maxTotalSize = 10 * 1024 * 1024; // 10MB
    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > maxTotalSize) {
      alert(
        'Total file size exceeds 10MB limit. Please select smaller files or fewer files.'
      );
      return;
    }
    setFiles(selectedFiles);
  };

  const handleTextareaChange = (e) => {
    if (e.target.value.length <= 5000) {
      setMessage(e.target.value);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    // Get plain text from clipboard
    const plainText = e.clipboardData.getData('text/plain');

    // Try to get HTML from clipboard if available
    const html = e.clipboardData.getData('text/html');

    let processedText = plainText;

    if (html) {
      // Convert HTML formatting to markdown
      let tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      // Convert <strong> and <b> tags to **text**
      const strongElements = tempDiv.querySelectorAll('strong, b');
      strongElements.forEach((el) => {
        const text = el.textContent;
        el.outerHTML = `**${text}**`;
      });

      // Convert <em> and <i> tags to *text*
      const emElements = tempDiv.querySelectorAll('em, i');
      emElements.forEach((el) => {
        const text = el.textContent;
        el.outerHTML = `*${text}*`;
      });

      // Get the processed text
      processedText = tempDiv.textContent || tempDiv.innerText || plainText;
    }

    // Insert the processed text at cursor position
    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newValue =
      message.substring(0, start) + processedText + message.substring(end);

    if (newValue.length <= 5000) {
      setMessage(newValue);
    }
  };

  const fetchMessages = async () => {
    try {
      if (initialFetch) {
        setLoading(true);
        setInitialFetch(false);
      }
      const response = await CentralAPIHandler.handleGetRequest(
        `${process.env.NEXT_PUBLIC_CONSOLE_BACKEND_SERVICE_URL}/v1/freshdesk/get-ticket-conversations?ticket_id=${selectedTicket?.freshdesk_ticket_id}&page=1&per_page=200`
      );
      if (conversations?.length < response?.conversations?.length) {
        setConversations(response?.conversations);
        // Use requestAnimationFrame for smoother scrolling
        requestAnimationFrame(() => {
          setTimeout(() => scrollToBottom(), 50);
        });
      }
    } catch (error) {
      setFetchError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    try {
      if (message.trim() === '') {
        setSendError('Please enter a message');
        return;
      }
      setSendError(null);
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('body', message);
      formData.append('ticket_id', selectedTicket.freshdesk_ticket_id);

      if (files.length > 0) {
        files.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_CONSOLE_BACKEND_SERVICE_URL}/v1/freshdesk/create-reply`,
        formData,
        {
          headers: {
            authorization: defaultBearerToken,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      const newMessage = data?.conversation;
      setConversations([...conversations, newMessage]);
      setMessage('');
      setFiles([]);
      // Scroll to bottom after sending message
      requestAnimationFrame(() => {
        setTimeout(() => scrollToBottom(), 50);
      });
    } catch (error) {
      setSendError(
        'Failed to send message: ' +
          (error.message || error.response?.data?.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = files?.filter((_, i) => i !== index);
    setFiles(newFiles);
    const input = document.getElementById('help-modal-file-input');

    if (input && input.files) {
      const dt = new DataTransfer();
      Array.from(input.files).forEach((f, i) => {
        if (i !== index) dt.items.add(f);
      });
      input.files = dt.files;
    }
  };

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages();
    }
  }, [selectedTicket]);

  useEffect(() => {
    if (selectedTicket && !initialFetch) {
      const id = setInterval(fetchMessages, 60000);
      setIntervalId(id);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [selectedTicket, initialFetch]);

  useEffect(() => {
    if (!isOpen) {
      clearInterval(intervalId);
      setConversations([]);
      setInitialFetch(true);
      setLoading(false);
      setFetchError(null);
    }
  }, [isOpen]);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = document.querySelector('textarea[placeholder="Message"]');
    if (textarea) {
      textarea.rows = 1;

      const scrollHeight = textarea.scrollHeight;
      const lineHeight = 24;
      const maxHeight = lineHeight * 3;

      if (scrollHeight <= lineHeight) {
        textarea.rows = 1;
      } else if (scrollHeight <= maxHeight) {
        textarea.rows = Math.ceil(scrollHeight / lineHeight);
      } else {
        textarea.rows = 3;
      }
    }
  }, [message]);

  useEffect(() => {
    if (conversations.length > 0) {
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [conversations]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('defaultBearerToken');
      setDefaultBearerToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (isIframe && bearer_token) {
      setDefaultBearerToken(bearer_token);
    }
  }, [isIframe, bearer_token]);

  if (!isOpen || !selectedTicket) return null;

  return (
    <div className={`${isIframe ? 'flex h-full flex-col' : ''}`}>
      <div className="flex items-center justify-between border-b p-5">
        <div className="flex items-center gap-3">
          <SVG
            iconName="chevron"
            rotate={90}
            className="h-5 w-5 cursor-pointer text-black/80"
            onClick={() => {
              setModalType('allTickets');
              setSelectedTicket(null);
            }}
          />
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              {selectedTicket?.subject?.length > 20 ? (
                <Tooltip content={selectedTicket?.subject} position="bottom">
                  <span className="text-base font-medium leading-snug text-black/80">
                    {selectedTicket?.subject.substring(0, 20)}...
                  </span>
                </Tooltip>
              ) : (
                <span className="text-base font-medium leading-snug text-black/80">
                  {selectedTicket?.subject}
                </span>
              )}
              <div
                className={`px-2 py-0.5 text-xs font-medium ${selectedTicket?.status === 'Open' ? 'bg-[#FFFAEB] text-[#866800]' : 'bg-[#ECFDF3] text-[#027A48]'}`}
              >
                {selectedTicket?.status}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-normal leading-none text-black/60">
                Ticket ID: {selectedTicket?.freshdesk_ticket_id}
              </span>
              <span className="text-xs font-normal leading-none text-black/60">
                Started: {formatDate(selectedTicket?.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <SVG
          iconName="crossIcon"
          className="cursor-pointer"
          onClick={onClose}
        />
      </div>

      <div className="relative min-h-[65vh] p-6 pb-1">
        {/* Chat Messages Area */}
        {loading && (
          <div className="flex h-full items-center justify-center">
            Loading...
          </div>
        )}
        {fetchError && !loading && (
          <div className="flex h-full items-center justify-center">
            {fetchError}
          </div>
        )}
        {!loading && !fetchError && (
          <div
            className={`scrollbar-hide ${isIframe ? '!h-[67vh]' : 'max-h-[280px] md:max-h-[400px]'} space-y-4 overflow-y-auto`}
          >
            {conversations?.map((conversation) => (
              <div key={conversation.conversation_id}>
                {conversation.incoming ? (
                  // User
                  <div className="flex w-full justify-end">
                    <div className="flex w-full flex-col items-end">
                      <div className="max-w-[80%] rounded-2xl bg-[#8A61EE] px-4 py-3 text-white">
                        <p
                          className="overflow-wrap-anywhere whitespace-pre-wrap break-words text-sm font-normal leading-tight text-white"
                          dangerouslySetInnerHTML={{
                            __html: parseMessageFormatting(
                              conversation.message
                            ),
                          }}
                        />
                      </div>

                      {conversation.attachments?.map((attachment) => (
                        <div
                          key={attachment.id || attachment.name}
                          className="mt-1 flex max-w-[80%] items-center gap-3 rounded-2xl bg-[#8A61EE] px-3 py-2"
                        >
                          <div
                            className="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white/20"
                            onClick={() => {
                              window.open(attachment?.attachment_url, '_blank');
                            }}
                          >
                            <img
                              src={attachment?.attachment_url}
                              alt="Attachment"
                              className="h-6 w-6 rounded object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="hidden h-6 w-6 items-center justify-center text-xs font-medium text-white">
                              📎
                            </div>
                          </div>
                          <p className="min-w-0 flex-1 break-words text-xs font-normal leading-tight text-white/80">
                            {attachment?.name}
                          </p>
                        </div>
                      ))}

                      <span className="mt-1 text-xs font-normal leading-none text-black/60">
                        {formatDate(conversation?.createdAt, true)}
                      </span>
                    </div>
                  </div>
                ) : (
                  // Agent Messages
                  <div className="flex w-full justify-start">
                    <div className="flex w-full flex-col items-start">
                      <div className="max-w-[80%]">
                        <div className="rounded-2xl bg-[#F5F5F5] p-4 text-black">
                          <span className="mb-1 text-xs font-normal leading-none text-violet-500">
                            Spyne Support
                          </span>
                          <p
                            className="overflow-wrap-anywhere whitespace-pre-wrap break-words text-sm font-normal leading-tight text-black"
                            dangerouslySetInnerHTML={{
                              __html: parseMessageFormatting(
                                conversation.message
                              ),
                            }}
                          />
                        </div>
                      </div>
                      {conversation?.attachments?.map((attachment) => (
                        <div
                          key={attachment?.id || attachment?.name}
                          className="mt-1 flex max-w-[80%] items-center gap-3 rounded-2xl bg-[#F5F5F5] px-3 py-2"
                        >
                          <div
                            className="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white/60"
                            onClick={() => {
                              window.open(attachment?.attachment_url, '_blank');
                            }}
                          >
                            <img
                              src={attachment?.attachment_url}
                              alt="Attachment"
                              className="h-6 w-6 rounded object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="hidden h-6 w-6 items-center justify-center text-xs font-medium text-gray-600">
                              📎
                            </div>
                          </div>
                          <p className="min-w-0 flex-1 break-words text-xs font-normal leading-tight text-black/80">
                            {attachment?.name}
                          </p>
                        </div>
                      ))}
                      <span className="mt-1 text-xs font-normal leading-none text-black/60">
                        {formatDate(conversation?.createdAt, true)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Scroll target element */}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div
          className={`fixed bottom-6 left-6 right-6 ${isIframe ? 'bottom-6' : ''}`}
        >
          <div
            className={`flex flex-col gap-1 rounded-2xl border bg-white p-4 py-2 transition-all duration-200 ${
              isInputFocused
                ? 'border-purple-300 ring-2 ring-purple-100'
                : 'border-2 border-gray-200'
            } ${selectedTicket?.status === 'Closed' || isSubmitting ? 'pointer-events-none opacity-50' : ''}`}
          >
            <textarea
              type="text"
              placeholder="Message"
              value={message}
              onChange={handleTextareaChange}
              onPaste={handlePaste}
              rows={1}
              maxLength={5000}
              className="max-h-[4.5rem] min-h-[1.5rem] w-full resize-none overflow-y-auto border-none text-base placeholder-gray-400 outline-none"
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
            />
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2"
                  >
                    <span className="max-w-[120px] truncate text-xs text-gray-600">
                      {file.name?.length > 20
                        ? file.name?.substring(0, 20) + '...'
                        : file.name}
                    </span>
                    <button
                      className="rounded-full p-0.5 hover:bg-gray-200"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <SVG
                        iconName="crossIcon"
                        className="h-3 w-3 cursor-pointer text-gray-500"
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between">
              {sendError && (
                <p className="text-[10px] font-normal leading-none text-red-500">
                  {sendError}
                </p>
              )}
              <input
                className="hidden rounded-lg border-[#E5E5E5] text-sm"
                type="file"
                id="help-modal-file-input"
                multiple
                disabled={isSubmitting}
                onChange={onFileChange}
                accept="image/*,.pdf,.doc,.docx,.txt,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv"
              />
              <button
                className="rounded-full p-1 transition-colors hover:bg-gray-200"
                onClick={() => {
                  document.getElementById('help-modal-file-input').click();
                }}
              >
                <SVG iconName="AttachFile" className="h-5 w-5 text-gray-500" />
              </button>
              <button
                className="rounded-full bg-[#8A61EE] p-1 transition-colors disabled:bg-[#F5F5F5]"
                disabled={(!message && !files.length) || isSubmitting}
                onClick={sendMessage}
              >
                <SVG
                  iconName="UpArrow"
                  className="h-5 w-5"
                  fill={
                    (!message && !files.length) || isSubmitting
                      ? 'gray'
                      : 'white'
                  }
                />
              </button>
            </div>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            {isSubmitting && (
              <span className="text-[10px] text-gray-400">Sending...</span>
            )}
            <span className="text-xs text-gray-400">
              {message?.length}/5000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectMessages;
