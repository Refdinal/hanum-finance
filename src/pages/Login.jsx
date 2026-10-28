import React, { useState } from "react";
import { checkPassword, saveSession } from "../lib/auth";
import { Button } from "../components/ui";

const Login = ({ onSuccess }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (checkPassword(password)) {
      saveSession();
      onSuccess();
    } else {
      setError("Password salah!");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card-flat w-full max-w-sm p-8 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-ink-plum text-2xl text-hero-violet">
          ₣
        </div>
        <h1 className="font-serif text-2xl font-normal text-ink-plum">Protected Area</h1>
        <p className="mt-2 text-sm text-slate">Masukkan password untuk masuk.</p>

        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="input-dark text-center"
          />
          {error && <p className="mt-2 text-sm text-rose">{error}</p>}
          <Button type="submit" className="mt-4 w-full">
            Unlock
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
