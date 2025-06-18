"use client";

import type { FC, PropsWithChildren } from "react";
import { queryClient } from "./queryClient";
import { QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";

export const QueryClientProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  );
};
