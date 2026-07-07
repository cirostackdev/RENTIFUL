"use client";

import { Button } from "@/shared/components/ui/button";
import { useLoginMutation } from "@/shared/state/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const SignIn = () => {
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await login({ email, password }).unwrap();
      router.push(
        result.userRole === "manager" ? "/managers/properties" : "/tenants/favorites"
      );
    } catch (err: any) {
      setError(err?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            RENT
            <span className="text-secondary-500 font-light">IFUL</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            <span className="font-bold">Welcome back!</span> Sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-700 text-white hover:bg-primary-800"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary-700 hover:underline font-medium">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
