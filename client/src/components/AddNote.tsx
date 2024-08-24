import React, { FC } from "react";
import { Button, Input } from "antd";

type AddNoteProps = { author: string };

const AddNote: FC<AddNoteProps> = ({ author }) => {
  const [text, setText] = React.useState<string>("");

  const handleAddNote = async () => {
    await fetch("/api/note", {
      method: "POST",
      body: JSON.stringify({ author, text }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // clear text after note has been added
    setText("");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleAddNote();
      }}
    >
      <Input
        id="noteText"
        onChange={(e) => setText(e.currentTarget.value)}
        value={text}
      />
      <Button>Submit</Button>
    </form>
  );
};

export default AddNote;
