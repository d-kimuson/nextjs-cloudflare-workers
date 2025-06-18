"use client";

import { QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";
import type { FC, PropsWithChildren } from "react";
import { queryClient } from "./queryClient";

export const QueryClientProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  );
};
