import React, { FC } from "react";
import { Button, Input } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { Flex } from "antd";

// "/create"

const CreateMeeting: FC = () => {
  return (
    <Flex
      style={{ width: "100%", height: "100vh" }}
      align="center"
      vertical
      justify="space-around"
    >
      <Flex
        vertical
        gap="middle"
        style={{
          width: "400px",
          border: "1px solid #1677ff",
          borderRadius: "8px",
          padding: "72px",
        }}
      >
        <Flex justify="space-between" align="center">
          Meeting name
          <Input value="Apollo team standup" style={{ width: "70%" }} />
        </Flex>
        <Flex justify="space-between" align="center" gap="6px">
          Meeting code
          <Input value="xyz-d89-s123" style={{ width: "60%" }} />
          <Button type="default" icon={<CopyOutlined />} />
        </Flex>
        <Flex justify="space-between" align="center" gap="6px">
          Speaker duration
          <Flex justify="space-around" gap="6px">
            <Button type="default">1m</Button>
            <Button type="primary">2m</Button>
            <Button type="default">3m</Button>
            <Button type="default">5m</Button>
          </Flex>
        </Flex>
        <Flex justify="space-between" align="center" gap="6px">
          Auto proceed to next speaker
          <Flex justify="space-around" gap="6px">
            <Button type="primary">Yes</Button>
            <Button type="default">No</Button>
          </Flex>
        </Flex>
        <Button type="primary" style={{ marginTop: "48px" }}>
          Create
        </Button>
      </Flex>
    </Flex>
  );
};

export default CreateMeeting;
