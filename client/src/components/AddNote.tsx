import React, { FC } from "react";
import { Button, Collapse } from "antd";
import { useNavigate } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";

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
    <Collapse
      style={{ textAlign: "left" }}
      ghost
      size="small"
      items={[
        {
          key: "1",
          label: "Add note",
          children: (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddNote();
              }}
            >
              <TextArea
                id="noteText"
                onChange={(e) => setText(e.currentTarget.value)}
                value={text}
              />
              <div
                style={{
                  marginTop: "18px",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Button
                  type="primary"
                  onClick={handleAddNote}
                  style={{ width: "150px" }}
                >
                  Add note
                </Button>
              </div>
            </form>
          ),
        },
      ]}
    />
  );
};

export default AddNote;
