import React from "react";

function Join({ joinMeeting }: { joinMeeting: (name: string) => void }) {
  const [name, setName] = React.useState<string>("");

  const handleJoin = async () => {
    await fetch("/api/join", {
      method: "POST",
      body: JSON.stringify({ name }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    joinMeeting(name);
  };

  return (
    <div className="App">
      <main>
        <div className="container">
          <div className="join">
            <h2>Join</h2>
            <p>Please enter your name:</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleJoin();
              }}
            >
              <input onChange={(e) => setName(e.currentTarget.value)} />
              <button type="submit">Join</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Join;
