import React, { useEffect } from "react";
import "./App.css";

type Person = { name: string };

function App() {
  const [name, setName] = React.useState<string>("");
  const [people, setPeople] = React.useState<Person[]>([]);

  const fetchPeople = async () => {
    const res = await fetch("/api/people");
    const data = await res.json();
    setPeople(data);
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const handleJoin = async () => {
    const res = await fetch("/api/join", {
      method: "POST",
      body: JSON.stringify({ name }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    fetchPeople();
  };

  return (
    <div className="App">
      <h1>Attendees</h1>
      <ul>
        {people.map((person, i) => (
          <li key={i}>{person.name}</li>
        ))}
      </ul>
      <p>Please enter your name</p>
      <form onSubmit={handleJoin}>
        <input onChange={(e) => setName(e.currentTarget.value)} />
        <button type="submit">Join</button>
      </form>
    </div>
  );
}

export default App;
