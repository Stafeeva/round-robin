import React, { FC } from "react";
import { Button } from "antd";
import { Flex } from "antd";
import { Link } from "react-router-dom";

const Home: FC = () => {
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
        <Button type="primary">
          <Link to="/create">Create a new meeting</Link>
        </Button>
        <Button type="primary">
          <Link to="/join">Join a meeting</Link>
        </Button>
      </Flex>
    </Flex>
  );
};

export default Home;
