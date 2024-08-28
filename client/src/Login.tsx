import React, { FC, useState } from "react";
import { Button, Input } from "antd";
import { useNavigate } from "react-router";

const Login: FC<{}> = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    console.log("username", username);
    console.log("password", password);

    // login user

    const response = await fetch("/api/speaker:login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    // assume we got 200
    // TODO: verify response status
    // TODO: handle 401
    const data = await response.json();
    console.log("data", data);
    localStorage.setItem("token", JSON.stringify(data));

    // redirect to home
    navigate("/");
  };

  return (
    <div style={{ width: "200px" }}>
      <h2>Username</h2>
      <Input onChange={(e) => setUsername(e.target.value)} value={username} />
      <h2>Password</h2>
      <Input
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        type="password"
      />
      <Button onClick={handleLogin}>Login</Button>
    </div>
  );
};

export default Login;
