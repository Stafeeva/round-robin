import React, { FC } from "react";
import App from "./App";
import Join from "./Join";

const Main: FC = () => {
  const [name, setName] = React.useState<string>("");

  return (
    <div>
      {name ? <App attendeeName={name} /> : <Join joinMeeting={setName} />}
    </div>
  );
};

export default Main;
