import React, { FC } from "react";
import { Card, Button } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

import "./Note.css";

type NoteProps = { note: { author: string; text: string } };

// TODO: implement delete and edit note
const Note: FC<NoteProps> = ({ note }) => {
  const { author, text } = note;

  const deleteNote = async () => {
    console.log("delete note");
  };

  const editNote = async () => {
    console.log("edit note");
  };

  return (
    <Card
      style={{
        width: "350px",
        marginBottom: "6px",
        textAlign: "left",
      }}
      size="small"
    >
      <div className="note__container">
        <div className="note__message">
          <strong>{author}: </strong>
          {text}
        </div>
        <div className="note__actions">
          <Button
            icon={<EditOutlined size={16} />}
            type="text"
            onClick={editNote}
          />
          <Button
            icon={<DeleteOutlined size={16} />}
            type="text"
            onClick={deleteNote}
          />
        </div>
      </div>
    </Card>
  );
};

export default Note;
