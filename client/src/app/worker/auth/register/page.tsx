"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Axios from "@/lib/Axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Eye, EyeOff, User, Mail, Lock } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await Axios.post(
        "/worker/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          // confirmPassword: formData.confirmPassword,
        },
        { withCredentials: true }
      );

      toast.success("Registered successfully!");
      setTimeout(() => {
        router.push("/worker/auth/login");
      }, 2000);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Registration failed";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingShape className="w-20 h-20 top-10 left-10" />
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
              Manage leads and 
              <span className="block text-blue-600">
              Track your performance
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-md">
              Register now to access your personal dashboard, manage assigned
              leads, and collaborate efficiently with your sales team — all in
              one place.
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

        {/* Signup Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-100/50 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Sign Up
                </h3>
                <p className="text-gray-600">
                  Create your account to get started
                </p>
              </div>

              <div className="space-y-6">
                {/* Full Name */}
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`pl-10 h-12 border-gray-200 text-black focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.name ? "border-red-500 ring-red-500" : ""
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm animate-slide-down">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-10 h-12 border-gray-200 text-black focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.email ? "border-red-500 ring-red-500" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm animate-slide-down">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={`pl-10 pr-10 h-12 border-gray-200 text-black focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.password ? "border-red-500 ring-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="text-red-500 text-sm animate-slide-down">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className={`pl-10 pr-10 h-12 border-gray-200 text-black focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.confirmPassword
                        ? "border-red-500 ring-red-500"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm animate-slide-down">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      handleInputChange("agreeToTerms", checked)
                    }
                    className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-600 leading-relaxed"
                  >
                    I agree with the{" "}
                    <a className="text-blue-600 underline">
                      Terms and Conditions
                    </a>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-red-500 text-sm animate-slide-down">
                    {errors.agreeToTerms}
                  </p>
                )}

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    "Create account"
                  )}
                </Button>

                <div className="text-center mt-6">
                  <p className="text-gray-500">
                    Already have an account?{" "}
                    <a
                      href="/worker/auth/login"
                      className="text-blue-600 hover:text-blue-700 font-semibold underline"
                    >
                      Log in
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
