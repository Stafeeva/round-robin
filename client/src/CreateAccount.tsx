import React, { FC, useState } from "react";
import { Button, Input } from "antd";
import { useNavigate } from "react-router";

const Login: FC<{}> = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleLogin = async () => {
    // login user
    const response = await fetch("/api/speaker", {
      method: "POST",
      body: JSON.stringify({ username, password, firstName, lastName }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 201) {
      navigate("/login");
    }
  };

  return (
    <div style={{ width: "300px" }}>
      <h1>Register</h1>
      <h2>First Name</h2>
      <Input onChange={(e) => setFirstName(e.target.value)} value={firstName} />
      <h2>Last Name</h2>
      <Input onChange={(e) => setLastName(e.target.value)} value={lastName} />
      <h2>Username</h2>
      <Input onChange={(e) => setUsername(e.target.value)} value={username} />
      <h2>Password</h2>
      <Input
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        type="password"
      />
      <div className="action-buttons">
        <Button type="primary" onClick={() => navigate("/login")}>
          Back to login
        </Button>
        <Button type="primary" onClick={handleLogin}>
          Create account
        </Button>
      </div>
    </div>
  );
};

export default Login;
