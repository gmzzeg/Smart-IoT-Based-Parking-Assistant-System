import { Slot } from 'expo-router';
import { ReduxProvider } from '../providers/ReduxProvider';

export default function RootLayout() {
  return (
    <ReduxProvider>
      <Slot />
    </ReduxProvider>
  );
}
