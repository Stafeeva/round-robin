import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Join from "./Join";
import Home from "./Home";
import CreateMeeting from "./CreateMeeting";
import Meeting from "./Meeting";
import Login from "./Login";
import CreateAccount from "./CreateAccount";

import "./index.css";
import Layout from "./Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  },
  {
    path: "/login",
    element: (
      <Layout>
        <Login />
      </Layout>
    ),
  },
  {
    path: "/create-account",
    element: (
      <Layout>
        <CreateAccount />
      </Layout>
    ),
  },
  {
    path: "/join",
    element: (
      <Layout>
        <Join />
      </Layout>
    ),
  },
  {
    path: "/create",
    element: (
      <Layout>
        <CreateMeeting />
      </Layout>
    ),
  },
  {
    path: "/meeting/:code",
    element: (
      <Layout>
        <Meeting />
      </Layout>
    ),
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(<RouterProvider router={router} />);
