import React from "react";
import { render, screen } from "@testing-library/react";

import Note from "./Note";

const testNote = { author: "Dylan", text: "This is a note" };

test("Home component renders", () => {
  const { container } = render(<Note note={testNote} />);

  expect(container).toMatchSnapshot();
});

test("User can see the author and text of a note", () => {
  render(<Note note={testNote} />);

  const author = screen.getByText("Dylan:");
  const text = screen.getByText("This is a note");

  expect(author).toBeInTheDocument();
  expect(text).toBeInTheDocument();
});

// TODO: test edit and delete note
