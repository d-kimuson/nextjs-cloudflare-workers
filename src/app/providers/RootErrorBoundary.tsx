"use client";

import type { FC, PropsWithChildren } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorBoundaryFallback } from "../../components/ErrorBoundaryFallback";

export const RootErrorBoundary: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      {children}
    </ErrorBoundary>
  );
};
