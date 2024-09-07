import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import Main from "./Main";
import Home from "./Home";
import CreateMeeting from "./CreateMeeting";
import Meeting from "./Meeting";
import Login from "./Login";
import CreateAccount from "./CreateAccount";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/create-account",
    element: <CreateAccount />,
  },
  {
    path: "/join",
    element: <Main />,
  },
  {
    path: "/create",
    element: <CreateMeeting />,
  },
  {
    path: "/meeting/:code",
    element: <Meeting />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(<RouterProvider router={router} />);
