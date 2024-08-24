import React from "react";
import { render } from "@testing-library/react";

import Meeting from "./Meeting";

const meeting = () => render(<Meeting attendeeName="Dylan" />);

test("Meeting component renders", () => {
  const { container } = meeting();
  expect(container).toMatchSnapshot();
});

// test("User can start a meeting by clicking Start button", () => {
//   const { getByText } = meeting();
//   const startButton = getByText("Start");
//   expect(startButton).toBeInTheDocument();
// });
