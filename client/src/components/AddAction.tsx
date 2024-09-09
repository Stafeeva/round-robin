import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Select, Collapse } from "antd";
import TextArea from "antd/es/input/TextArea";

type Speaker = {
  firstName: string;
  lastName: string;
  id: number;
};

const AddAction: FC<{ meetingCode: string; speakers: Speaker[] }> = ({
  meetingCode,
  speakers,
}) => {
  const [owner, setOwner] = React.useState<number>(speakers?.[0].id);
  const [text, setText] = React.useState<string>("");

  const navigate = useNavigate();

  const handleAddAction = async () => {
    const payload = { ownerId: owner, text };

    const token = JSON.parse(localStorage.getItem("token") as string);

    const response = await fetch(`/api/meeting/${meetingCode}/action`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.token}`,
      },
    });

    // if response is 401 then the token is invalid, redirect to login
    if (response.status === 401) {
      navigate("/login");
    }

    setText("");
  };

  return (
    <Collapse
      style={{ textAlign: "left" }}
      size="small"
      ghost
      items={[
        {
          key: "2",
          label: "Add action",
          children: (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddAction();
              }}
            >
              <label htmlFor="assignee">Assignee: </label>
              <Select
                id="assignee"
                defaultValue={speakers?.[0].id}
                onChange={(e) => {
                     setOwner(Number(e));
                }}
                style={{ marginBottom: "18px" }}
              >
                {speakers?.map((speaker, i) => (
                  <option key={i} value={speaker.id}>
                    {speaker.firstName} {speaker.lastName}
                  </option>
                ))}
              </Select>

              <TextArea
                id="actionText"
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
                  onClick={handleAddAction}
                  style={{ width: "150px" }}
                >
                  Add Action
                </Button>
              </div>
            </form>
          ),
        },
      ]}
    />
  );
};

export default AddAction;
