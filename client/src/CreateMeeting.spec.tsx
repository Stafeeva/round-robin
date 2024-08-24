import React from "react";
import { render } from "@testing-library/react";

import CreateMeeting from "./CreateMeeting";

const createMeeting = () => render(<CreateMeeting />);

// test Create meeting renders
test("Create meeting component renders", () => {
  const { container } = createMeeting();
  expect(container).toMatchSnapshot();
});

test("Allows user to input meeting name", () => {
  const { getByText } = createMeeting();
  const input = getByText("Meeting name");
  expect(input).toBeInTheDocument();
});

test("Allows user to copy meeting code", () => {
  const { getByText } = createMeeting();
  const input = getByText("Meeting code");
  expect(input).toBeInTheDocument();
});

test("User can select a meeting duration", () => {
  const { getByText } = createMeeting();
  const input = getByText("Speaker duration");
  expect(input).toBeInTheDocument();
});

test("User can select to auto proceed to next speaker", () => {
  const { getByText } = createMeeting();
  const input = getByText("Auto proceed to next speaker");
  expect(input).toBeInTheDocument();
});

test("User can create a meeting", () => {
  const { getByText } = createMeeting();
  const input = getByText("Create");
  expect(input).toBeInTheDocument();
});
