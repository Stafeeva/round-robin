import React, { FC, useEffect } from "react";
import { Button } from "antd";
import { Flex } from "antd";
import { Link, useNavigate } from "react-router-dom";

const Home: FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // get token from local storage
    const token = localStorage.getItem("token");

    console.log("token", token);
    // if token exist, redirect to login page
    if (token === null) {
      navigate("/login");
    }

    const parsedToken = JSON.parse(token as string);
    console.log("parsedToken", parsedToken);

    // fetch list of meetings from api
    fetch("/api/meeting", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${parsedToken.token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("data", data);
      });
  }, []);

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
