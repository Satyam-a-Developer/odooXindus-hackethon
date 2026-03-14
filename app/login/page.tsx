"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();

  const handleLogin = () => {
    if (!email || !password) {
      setMessage("Please fill all fields");
      return;
    }

    // Save credentials to localStorage
    localStorage.setItem("currentUserEmail", email);
    localStorage.setItem("currentUserPassword", password);
    setMessage("Credentials saved!");

    // Redirect to dashboard after login
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white shadow rounded">
        <h1 className="text-xl font-bold mb-4 text-center">Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {message && <p className="text-center mb-3 text-green-600">{message}</p>}

        <button
          onClick={handleLogin}
          className="w-full p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}