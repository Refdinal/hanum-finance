import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { clearSession, isSessionValid } from "./lib/auth";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import TransactionForm from "./pages/TransactionForm";
import Investasi from "./pages/Investasi";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(isSessionValid());

  if (!loggedIn) return <Login onSuccess={() => setLoggedIn(true)} />;

  const logout = () => {
    clearSession();
    setLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <Navbar onLogout={logout} />
      <main className="mx-auto max-w-[1200px] px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions/new" element={<TransactionForm />} />
          <Route path="/transactions/edit/:id" element={<TransactionForm />} />
          <Route path="/investasi" element={<Investasi />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;
