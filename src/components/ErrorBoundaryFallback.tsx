import type { FC } from "react";
import { isBaseError } from "../lib/error/BaseError";
import { ErrorPage } from "./ErrorPage";

type ErrorBoundaryFallbackProps = {
  error?: Error;
  resetErrorBoundary?: () => void;
};

export const ErrorBoundaryFallback: FC<ErrorBoundaryFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const handleRefresh = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="error-boundary-wrapper">
      {isBaseError(error) ? (
        <ErrorPage
          statusCode={error.status}
          title={error.message}
          message={error.message}
          showRefresh={true}
          showHome={true}
          onRefresh={handleRefresh}
        />
      ) : (
        <ErrorPage
          statusCode={500}
          title="予期しないエラーが発生しました"
          message={
            error?.message ||
            "アプリケーションでエラーが発生しました。ページを再読み込みしてお試しください。"
          }
          showRefresh={true}
          showHome={true}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
};
