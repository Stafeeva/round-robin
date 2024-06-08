import React, { useEffect } from "react";
import "./App.css";

function App() {
  useEffect(() => {
    const sayHello = async () => {
      const response = await fetch("/api/hello");
      const body = await response.json();
      console.log(body);
    };
    sayHello();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>Hello!</p>
      </header>
    </div>
  );
}

export default App;
