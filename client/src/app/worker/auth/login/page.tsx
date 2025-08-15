"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, BookOpen } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { toast} from "sonner";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Link from "next/link";
import Axios from "@/lib/Axios";

interface LoginData {
  email: string;
  password: string;
}

export default function WorkerLogin() {
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const otpInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      formRef.current?.classList.remove("translate-y-10", "opacity-0");
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (field: keyof LoginData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async () => {
    if (!formData.email || !formData.password) {
      toast.error("Email and Password are required");
      return;
    }

    setIsLoading(true);
    try {
      await Axios.post("/worker/login", formData);

      toast.success("Login successful! Redirecting to Dashboard...");
      setTimeout(() => {
        // router.push("/worker/dashboard");
        window.location.replace("/worker/dashboard");
      }, 1500);
    } catch (err: any) {
      const msg = err.response.data.error.message || "Login failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const FloatingBook = ({
    className,
    delay = 0,
  }: {
    className: string;
    delay?: number;
  }) => (
    <div
      className={`absolute ${className} animate-pulse`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: "3s",
      }}
    >
      <BookOpen className="w-6 h-6 text-blue-300/60 transform rotate-12" />
    </div>
  );

  const FloatingShape = ({
    className,
    color = "bg-blue-200/30",
  }: {
    className: string;
    color?: string;
  }) => (
    <div
      className={`absolute ${className} ${color} rounded-full blur-sm animate-float`}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col lg:flex-row items-center justify-center p-4 relative overflow-hidden">
      <FloatingShape className="w-20 h-20 top-10 left-10 bg-blue-200/30" />
      <FloatingShape className="w-32 h-32 top-20 right-20 bg-indigo-200/30" />
      <FloatingShape className="w-24 h-24 bottom-20 left-20 bg-purple-200/20" />
      <FloatingShape className="w-16 h-16 bottom-32 right-32 bg-blue-100" />

      <FloatingBook className="top-16 left-1/4" delay={0} />
      <FloatingBook className="top-1/3 right-1/4" delay={1} />
      <FloatingBook className="bottom-1/4 left-1/3" delay={2} />

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        <div className="text-center lg:text-left space-y-6 relative">
          <div className="inline-flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Worker's Zone</h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Welcome Back to Your
              <span className="block text-blue-600">Worker Hub</span>
            </h2>

            <p className="text-gray-600 text-lg max-w-md">
              Manage your workflow, stay organized, and access your dashboard
              securely.
            </p>
          </div>

          <div className="relative mt-12 lg:mt-16">
            <div className="w-80 h-80 mx-auto lg:mx-0 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-40 bg-gradient-to-b from-blue-400 to-blue-500 rounded-t-full relative animate-bounce-slow">
                  <div className="w-8 h-8 bg-orange-300 rounded-full absolute top-4 left-1/2 transform -translate-x-1/2" />
                  <div className="w-20 h-24 bg-blue-600 rounded-lg absolute bottom-0 left-1/2 transform -translate-x-1/2" />
                </div>
              </div>
              <div className="absolute inset-0">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-spin-slow"
                    style={{
                      top: `${20 + i * 10}%`,
                      left: `${15 + i * 12}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: "8s",
                    }}
                  >
                    <BookOpen className="w-8 h-8 text-blue-400/70" />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 -z-10">
                <div className="w-full h-full bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-100/50 shadow-xl text-gray-900">
            <CardContent className="p-8">
              <div
                ref={formRef}
                className="transform transition-all duration-700 translate-y-10 opacity-0"
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Worker Login
                  </h3>
                  <p className="text-gray-600">
                    Access your dashboard securely
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      ref={emailInputRef}
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="pl-10 h-12 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="pl-10 h-12 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <Button
                    onClick={onSubmit}
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Logging in...</span>
                      </div>
                    ) : (
                      "Login"
                    )}
                  </Button>
                  <p className="text-sm text-center text-gray-500 mt-4">
                    New user?{" "}
                    <Link
                      href="/worker/auth/register"
                      className="text-blue-600 hover:underline"
                    >
                      Sign up here
                    </Link>
                  </p>

                  <div className="text-center text-sm text-gray-500 mt-6 space-y-1">
                    <p>
                      <button
                        onClick={() => setShowForgot(true)}
                        className="text-indigo-600 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </p>
                    <p>
                      Need assistance?{" "}
                      <Link
                        href="#"
                        className="text-indigo-600 hover:underline"
                      >
                        Contact Support
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {showForgot && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 text-gray-900">
            <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4 shadow-lg text-gray-900">
              <h3 className="text-lg font-semibold text-center text-gray-900">
                Forgot Password
              </h3>

              <Input
                type="email"
                placeholder="Enter your registered email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />

              <Button
                onClick={async () => {
                  if (!forgotEmail) {
                    toast.error("Please enter your email.");
                    return;
                  }
                  try {
                    await axios.post("http://localhost:8080/api/v1/worker/forgot-password", {
                      email: forgotEmail,
                    });
                    toast.success("OTP sent to your email.");
                    setShowForgot(false);
                  } catch (error: any) {
                    const msg = error.response?.data?.message || "Failed to send OTP.";
                    toast.error(msg);
                  }
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Send OTP
              </Button>

              <Button
                variant="ghost"
                onClick={() => setShowForgot(false)}
                className="w-full text-gray-500"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
