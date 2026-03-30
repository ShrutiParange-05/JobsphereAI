"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface LoginFormData {
  email: string;
  password: string;
}

interface ApiResponse {
data: {
    user: {
        name: string;
        email: string;
        id: number;
    };
    accessToken: string;
};
  message: string;
}

const Page = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    try {
      const response = await axios.post<ApiResponse>(
        `${backendUrl}/user/login`,
        {
          email: data.email,
          password: data.password,
        }
      );

      if (response.status === 200 || response.status === 201) {
        setIsRedirecting(true);
        const { user, accessToken } = response.data.data;

        // Store user data and token in localStorage
        localStorage.setItem("userId", user.id.toString());
        localStorage.setItem("userName", user.name);
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("accessToken", accessToken);

        toast({
          title: "Success",
          description: "Login successful!",
        });
        router.push("/dashboard");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Login failed. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      {(isRedirecting || isSubmitting) && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm">
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full blur-xl bg-cyan-500/30 animate-pulse"></div>
            {/* Main spinner */}
            <div className="relative w-16 h-16 border-4 border-gray-800 border-t-cyan-500 rounded-full animate-spin shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
            {/* Inner pulsating dot */}
            <div className="absolute inset-0 m-auto w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
          </div>
          <h2 className="mt-8 text-xl font-medium tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse">
            Authenticating
          </h2>
          <p className="mt-2 text-sm text-gray-500">Preparing your personalized dashboard...</p>
        </div>
      )}
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-gray-900 text-white border-gray-800 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white">
            Login to Your Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                placeholder="Enter your email"
                className={`bg-gray-800 text-white placeholder:text-gray-500 border-gray-700 focus:border-cyan-500 focus:ring-cyan-500 ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">
                  {errors.email.message?.toString()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                placeholder="Enter your password"
                className={`bg-gray-800 text-white placeholder:text-gray-500 border-gray-700 focus:border-cyan-500 focus:ring-cyan-500 ${errors.password ? "border-red-500" : ""}`}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message?.toString()}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white transition-all transform hover:scale-[1.02]" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-gray-800 pt-6">
          <div className="text-sm text-gray-400">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors font-medium">
              Create an account here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
    </>
  );
};

export default Page;
