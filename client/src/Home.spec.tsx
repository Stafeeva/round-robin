import React from "react";
import { render } from "@testing-library/react";

import Home from "./Home";

test("Home component renders", () => {
  const { container } = render(<Home />);
  expect(container).toMatchSnapshot();
});

test("User can choose to create a meeting", () => {
  const { getByText } = render(<Home />);
  const createMeetingButton = getByText("Create a new meeting");
  expect(createMeetingButton).toBeInTheDocument();
});

test("User can choose to join a meeting", () => {
  const { getByText } = render(<Home />);
  const joinMeetingButton = getByText("Join a new meeting");
  expect(joinMeetingButton).toBeInTheDocument();
});
