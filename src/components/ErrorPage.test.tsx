import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorPage } from "./ErrorPage";

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

describe("ErrorPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("デフォルトのプロパティで正しくレンダリングされる", () => {
    render(<ErrorPage statusCode={500} />);

    expect(screen.getByText("500")).toBeInTheDocument();
    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    expect(
      screen.getByText("申し訳ありませんが、問題が発生しました。"),
    ).toBeInTheDocument();
    expect(screen.getByText("ページを再読み込み")).toBeInTheDocument();
    expect(screen.getByText("ホームに戻る")).toBeInTheDocument();
  });

  it("カスタムプロパティで正しくレンダリングされる", () => {
    render(
      <ErrorPage
        statusCode={404}
        title="ページが見つかりません"
        message="お探しのページは存在しません。"
        showRefresh={false}
        showHome={true}
      />,
    );

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("ページが見つかりません")).toBeInTheDocument();
    expect(
      screen.getByText("お探しのページは存在しません。"),
    ).toBeInTheDocument();
    expect(screen.queryByText("ページを再読み込み")).not.toBeInTheDocument();
    expect(screen.getByText("ホームに戻る")).toBeInTheDocument();
  });

  it("リフレッシュボタンがクリックされたときにページが再読み込みされる", () => {
    render(<ErrorPage statusCode={500} showRefresh={true} />);

    const refreshButton = screen.getByText("ページを再読み込み");
    fireEvent.click(refreshButton);

    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });

  it("カスタムonRefreshが提供された場合、それが呼び出される", () => {
    const mockOnRefresh = vi.fn();
    render(
      <ErrorPage
        statusCode={500}
        showRefresh={true}
        onRefresh={mockOnRefresh}
      />,
    );

    const refreshButton = screen.getByText("ページを再読み込み");
    fireEvent.click(refreshButton);

    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    expect(window.location.reload).not.toHaveBeenCalled();
  });

  it("ホームリンクが正しいhrefを持つ", () => {
    render(<ErrorPage statusCode={500} showHome={true} />);

    const homeLink = screen.getByText("ホームに戻る").closest("a");
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("showRefreshがfalseの場合、リフレッシュボタンが表示されない", () => {
    render(<ErrorPage statusCode={500} showRefresh={false} />);

    expect(screen.queryByText("ページを再読み込み")).not.toBeInTheDocument();
  });

  it("showHomeがfalseの場合、ホームボタンが表示されない", () => {
    render(<ErrorPage statusCode={500} showHome={false} />);

    expect(screen.queryByText("ホームに戻る")).not.toBeInTheDocument();
  });
});
