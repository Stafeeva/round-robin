import React, { FC, useState } from "react";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox } from "antd";

import "./ActionItem.css";

type ActionItemProps = {
  ownerName: string;
  text: string;
  completed?: boolean;
};

const ActionItem: FC<ActionItemProps> = ({ ownerName, text, completed }) => {
  const [completedState, setCompletedState] = useState<boolean>(
    completed || false
  );

  return (
    <Card
      style={{
        width: "350px",
        marginBottom: "6px",
        textAlign: "left",
      }}
      size="small"
    >
      <div className="action-item__container">
        <div
          className={
            `action-item__message` +
            (completedState ? " action-item__message--completed" : "")
          }
        >
          <Checkbox
            checked={completedState}
            onChange={() => setCompletedState(!completedState)}
            style={{ marginRight: "8px" }}
          />
          <strong>@{ownerName}: </strong>
          {text}
        </div>
        <div className="action-item__actions">
          <Button
            icon={<EditOutlined size={16} />}
            type="text"
            onClick={() => {}}
          />
          <Button
            icon={<DeleteOutlined size={16} />}
            type="text"
            onClick={() => {}}
          />
        </div>
      </div>
    </Card>
  );
};

export default ActionItem;
