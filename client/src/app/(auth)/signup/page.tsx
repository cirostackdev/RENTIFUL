"use client";

import { Button } from "@/shared/components/ui/button";
import { useRegisterMutation } from "@/shared/state/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const SignUp = () => {
  const [register, { isLoading }] = useRegisterMutation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"tenant" | "manager">("tenant");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      const result = await register({ name, email, password, role, phoneNumber }).unwrap();
      router.push(
        result.userRole === "manager" ? "/managers/properties" : "/tenants/favorites"
      );
    } catch (err: any) {
      setError(err?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            RENT
            <span className="text-secondary-500 font-light">IFUL</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Create your account to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

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
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min 8 characters)"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">I am a:</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="tenant"
                  checked={role === "tenant"}
                  onChange={() => setRole("tenant")}
                  className="accent-primary-700"
                />
                <span>Tenant</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="manager"
                  checked={role === "manager"}
                  onChange={() => setRole("manager")}
                  className="accent-primary-700"
                />
                <span>Property Manager</span>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-700 text-white hover:bg-primary-800"
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/signin" className="text-primary-700 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
