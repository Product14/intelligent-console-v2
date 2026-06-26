'use client';

import { Suspense } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SettingsSidebar } from '@/components/settings/shell/settings-sidebar';
import { ReduxProvider } from '@/components/settings/redux-provider';
import { ConsoleBridgeProvider } from '@/lib/settings/bridge/console-bridge-provider';

/**
 * Settings tab — secondary sidebar (Account / Studio AI / Integrations / Vini AI)
 * + page content. Wrapped in Redux + Bridge providers required by the ported
 * agent/policy components and progress hooks.
 */
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProvider>
      <ConsoleBridgeProvider>
        <div className="settings-scope flex h-full min-h-0 flex-1 bg-white">
          <Suspense fallback={null}>
            <SettingsSidebar />
          </Suspense>
          <main className="min-w-0 flex-1 overflow-y-auto">
            <div className="w-full px-6 py-8">{children}</div>
          </main>
          <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
        </div>
      </ConsoleBridgeProvider>
    </ReduxProvider>
  );
}
