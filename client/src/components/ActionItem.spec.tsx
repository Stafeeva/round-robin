import React from "react";
import { render } from "@testing-library/react";

import ActionItem from "./ActionItem";

const testAction = {
  asignee: "Dylan",
  text: "This is a note",
  completed: false,
};

test("Home component renders", () => {
  const { container } = render(<ActionItem actionItem={testAction} />);

  expect(container).toMatchSnapshot();
});
