"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";
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

const Page = () => {
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface SignUpFormData {
    name: string;
    email: string;
    password: string;
}

interface SignUpResponse {
    message: string;
    // Add other response fields if needed
}

const onSubmit = async (data: SignUpFormData) => {
    try {
        const response = await axios.post<SignUpResponse>(`${backendUrl}/user/adduser`, {
            name: data.name,
            email: data.email,
            password: data.password,
        });

        if (response.status === 200 || response.status === 201) {
            toast({
                title: "Success",
                description: "Account created successfully!",
            });
            router.push("/auth/login");
        }
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Something went wrong",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        }
    }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-gray-900 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Create Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-200">
                Name
              </Label>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
                placeholder="Enter your name"
                className={`bg-gray-800 text-white ${
                  errors.name ? "border-red-500" : "border-gray-700"
                }`}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name?.message?.toString()}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">
                Email
              </Label>
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
                className={`bg-gray-800 text-white ${
                  errors.email ? "border-red-500" : "border-gray-700"
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message?.toString()}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">
                Password
              </Label>
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
                className={`bg-gray-800 text-white ${
                  errors.password ? "border-red-500" : "border-gray-700"
                }`}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <span
              className="text-blue-400 hover:underline cursor-pointer"
              onClick={() => router.push("/auth/login")}
            >
              Login here
            </span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Page;
