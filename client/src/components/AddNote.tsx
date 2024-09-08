import React, { FC } from "react";
import { Button, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";

type AddNoteProps = { meetingCode: string };

const AddNote: FC<AddNoteProps> = ({ meetingCode }) => {
  const [text, setText] = React.useState<string>("");

  const navigate = useNavigate();

  const handleAddNote = async () => {
    const token = JSON.parse(localStorage.getItem("token") as string);

    const response = await fetch(`/api/meeting/${meetingCode}/note`, {
      method: "POST",
      body: JSON.stringify({ text }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.token}`,
      },
    });

    // if response is 401 then the token is invalid, redirect to login
    if (response.status === 401) {
      navigate("/login");
    }

    // else - assuming 201 for created
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
      <p>test</p>
      <Input
        id="noteText"
        onChange={(e) => setText(e.currentTarget.value)}
        value={text}
      />
      <Button onClick={handleAddNote}>Submit</Button>
    </form>
  );
};

export default AddNote;
