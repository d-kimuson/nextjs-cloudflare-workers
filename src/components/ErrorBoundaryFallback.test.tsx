import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorBoundaryFallback } from "./ErrorBoundaryFallback";

// Next.js のLinkコンポーネントをモック
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// window.location.reloadをモック
Object.defineProperty(window, "location", {
  value: {
    reload: vi.fn(),
  },
  writable: true,
});

describe("ErrorBoundaryFallback", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("エラーなしで正しくレンダリングされる", () => {
    render(<ErrorBoundaryFallback />);

    expect(screen.getByText("500")).toBeInTheDocument();
    expect(
      screen.getByText("予期しないエラーが発生しました"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "アプリケーションでエラーが発生しました。ページを再読み込みしてお試しください。",
      ),
    ).toBeInTheDocument();
  });

  it("エラーメッセージ付きで正しくレンダリングされる", () => {
    const error = new Error("テストエラーメッセージ");
    render(<ErrorBoundaryFallback error={error} />);

    expect(screen.getByText("テストエラーメッセージ")).toBeInTheDocument();
  });

  it("resetErrorBoundaryが提供された場合、それが呼び出される", () => {
    const mockReset = vi.fn();
    render(<ErrorBoundaryFallback resetErrorBoundary={mockReset} />);

    const refreshButton = screen.getByText("ページを再読み込み");
    fireEvent.click(refreshButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
    expect(window.location.reload).not.toHaveBeenCalled();
  });

  it("resetErrorBoundaryが提供されていない場合、window.location.reloadが呼び出される", () => {
    render(<ErrorBoundaryFallback />);

    const refreshButton = screen.getByText("ページを再読み込み");
    fireEvent.click(refreshButton);

    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });
});
