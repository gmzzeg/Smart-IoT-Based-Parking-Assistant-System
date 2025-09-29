// app/providers/ReduxProvider.tsx
import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store'; // store.ts dosyanızın yolu

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
