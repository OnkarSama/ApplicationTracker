"use client";

import type {ThemeProviderProps} from "next-themes";

import * as React from "react";
import {HeroUIProvider} from "@heroui/system";
import {useRouter} from "next/navigation";
import {ThemeProvider as NextThemesProvider} from "next-themes";
import {ToastProvider} from "@heroui/toast";

// 1. Import QueryClient and QueryClientProvider
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

// 2. Create a new QueryClient instance outside the component
// This prevents the client from being recreated on every render.
const queryClient = new QueryClient({
  // Optional: Configure default options here
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
    },
  },
});


declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
        Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({children, themeProps}: ProvidersProps) {
  const router = useRouter();

  return (
      // 3. Wrap the entire application (or the part using React Query)
      // with QueryClientProvider
      <QueryClientProvider client={queryClient}>
        <HeroUIProvider navigate={router.push}>
          <ToastProvider placement="bottom-center"/>
          <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
        </HeroUIProvider>
      </QueryClientProvider>
  );
}