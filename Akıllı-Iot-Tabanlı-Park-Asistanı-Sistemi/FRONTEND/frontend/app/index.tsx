import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Index(): null {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/userLogin/login');
    }, 0); // DOM ve RootLayout mount edildikten hemen sonra

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
