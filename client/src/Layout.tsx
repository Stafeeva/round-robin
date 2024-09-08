import React from "react";
import { Button, ConfigProvider } from "antd";
import { Header } from "antd/es/layout/layout";

import "./Layout.css";
import { Link, useNavigate } from "react-router-dom";

const getUsername = () => {
  const token = localStorage.getItem("token");

  if (token === null) {
    return "";
  }

  const parsedToken = JSON.parse(token as string);
  return parsedToken.username;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");

    return navigate("/login");
  };

  const username = getUsername();
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#008080",
        },
      }}
    >
      <Header
        style={{
          backgroundColor: "#008080",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Link to={`/`}>
          <span style={{ fontSize: "36px", color: "white" }}>Round Robin</span>
        </Link>

        {username && (
          <span>
            Logged in as {username}{" "}
            <Button size="small" onClick={handleLogout}>
              Logout
            </Button>
          </span>
        )}
      </Header>
      <main className="layout__container">{children}</main>
    </ConfigProvider>
  );
};

export default Layout;
