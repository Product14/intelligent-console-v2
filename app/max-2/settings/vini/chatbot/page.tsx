'use client';

import { ChatbotCommon } from '@/components/settings/general/chatbot-common';

export default function ChatbotPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-black-dark">Chatbot</h1>
        <p className="mt-1 text-sm text-black-60">
          The chat widget on your website. Turn it on or off, customize how it
          looks, and set the messages it suggests.
        </p>
      </header>
      <ChatbotCommon subStepId="chatbot" />
    </div>
  );
}
