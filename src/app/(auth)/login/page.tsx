"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // State to handle login errors
  const [loading, setLoading] = useState(false); // State for loading
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset error state
    setError(null);
    setLoading(true); // Set loading to true when submitting

    // Attempt to sign in
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Prevent default redirect
    });

    // Handle the result
    if (result?.error) {
      // If there's an error, set the error message
      setError(result.error);
    } else {
      // If login is successful, redirect to the home page
      router.push("/");
    }

    setLoading(false); // Reset loading state after processing
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md transform transition-all duration-300 hover:scale-105">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text animate-gradient">
          Welcome Back
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 text-gray-800" // Changed text color to dark gray
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 text-gray-800" // Changed text color to dark gray
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-md hover:bg-gradient-to-l transition-colors duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""}`} // Disable button during loading
            disabled={loading} // Disable button when loading
          >
            {loading ? "Loading..." : "Login"} {/* Show loading text when in loading state */}
          </button>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}