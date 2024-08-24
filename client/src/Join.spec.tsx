import React from "react";
import { render } from "@testing-library/react";

import Join from "./Join";
import userEvent from "@testing-library/user-event";

test("Join component renders", () => {
  const { container } = render(<Join joinMeeting={() => null} />);
  expect(container).toMatchSnapshot();
});

test("User can input their name", () => {
  const { getByText } = render(<Join joinMeeting={() => null} />);
  const input = getByText("Please enter your name:");
  expect(input).toBeInTheDocument();
});

// test("User can join a meeting", () => {
//   const { getByText } = render(<Join joinMeeting={() => null} />);
//   const input = getByText("Join");
//   userEvent.click(input);
//   expect(input).toBeInTheDocument();
// });
