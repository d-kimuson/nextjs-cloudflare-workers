import { render, screen } from "@testing-library/react";
import React from "react";
import { DailyRanking } from "./DailyRanking";

describe("DailyRanking", () => {
  it("ランキングタイトルが表示される", async () => {
    render(<DailyRanking doujinList={[]} />);
    expect(
      await screen.findByRole("heading", { name: "デイリーランキング" })
    ).toBeInTheDocument();
  });
});
