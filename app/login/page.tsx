"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Auth() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLoginMode) {
        // Login using Supabase Auth
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (loginError || !data.session) {
          setError(loginError?.message || "Invalid email or password");
          setLoading(false);
          return;
        }

        alert("Login successful!");
        router.push("/dashboard"); // redirect after login
      } else {
        // Register using Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        alert("User registered successfully! Please check your email for verification.");
        setIsLoginMode(true);
        setFormData({ email: "", password: "" });
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">
          {isLoginMode ? "Sign In" : "Register"}
        </h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-md"
          />
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-md"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-md"
          >
            {loading
              ? isLoginMode
                ? "Signing In..."
                : "Registering..."
              : isLoginMode
              ? "Sign In"
              : "Register"}
          </button>
        </form>

        <p className="text-center mt-4">
          {isLoginMode ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-blue-500 ml-2"
          >
            {isLoginMode ? "Register" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}