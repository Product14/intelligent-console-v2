'use client';

import { Provider } from 'react-redux';
import { store } from '@/store-settings';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
