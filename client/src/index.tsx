import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import Main from "./Main";
import Home from "./Home";
import CreateMeeting from "./CreateMeeting";
import Meeting from "./Meeting";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
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
    path: "/meeting/:id",
    element: <Meeting attendeeName="Natalia" />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(<RouterProvider router={router} />);
