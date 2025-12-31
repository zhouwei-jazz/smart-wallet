import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { QueryProvider } from '@/components/providers/query-provider';
import { SupabaseProvider, useSupabase } from '@/components/providers/supabase-provider';

// 初始化 Supabase 客户端
import '@/lib/supabase-init';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { user, loading } = useSupabase();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log('Route protection check:', { 
      loading, 
      user: user ? user.email : 'No user', 
      segments: segments.join('/') 
    });

    if (loading) {
      console.log('Still loading, waiting...');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    console.log('In auth group:', inAuthGroup);

    if (user && inAuthGroup) {
      // 用户已登录但在认证页面，重定向到主页
      console.log('User logged in, redirecting to tabs');
      router.replace('/(tabs)');
    } else if (!user && !inAuthGroup) {
      // 用户未登录但不在认证页面，重定向到登录页
      console.log('User not logged in, redirecting to login');
      router.replace('/(auth)/login');
    } else {
      console.log('No redirect needed');
    }
  }, [user, segments, loading, router]);

  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SupabaseProvider>
      <QueryProvider>
        <RootLayoutNav />
      </QueryProvider>
    </SupabaseProvider>
  );
}
