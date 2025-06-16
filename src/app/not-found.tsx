import { ErrorPage } from "../components/ErrorPage";

export default function NotFound() {
  return (
    <ErrorPage
      statusCode={404}
      title="ページが見つかりません"
      message="お探しのページは存在しないか、移動または削除された可能性があります。"
      showRefresh={false}
      showHome={true}
    />
  );
}
