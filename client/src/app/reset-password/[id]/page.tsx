"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; // Correct hook for Next.js params
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, Loader2, KeyRound, ShieldCheck, UserCog, LockOpen } from "lucide-react"; // KeyRound for OTP
import { toast } from "sonner";

import Axios from "@/lib/Axios";
// Mock Axios for API calls
// const Axios = {
//   post: async (url: string, data: any) => {
//     console.log(`Mock Axios POST request to: ${url} with data:`, data);
//     // Simulate API response based on the URL
//     if (url === "/manager/verify-otp") {
//       // Simulate OTP verification (e.g., a hardcoded OTP "123456" for a specific userId)
//       if (data.userId === "user123" && data.otp === "123456") {
//         return { data: { success: true, msg: "OTP verified." } };
//       } else {
//         return { data: { success: false, msg: "Invalid OTP or User ID." } };
//       }
//     } else if (url === "/manager/reset-password") {
//       // Simulate password reset
//       if (data.userId === "user123" && data.newPassword.length >= 8) {
//         return { data: { success: true, msg: "Password reset successfully." } };
//       } else {
//         return { data: { success: false, msg: "Password too short or invalid user." } };
//       }
//     }
//     // Default response for unknown endpoints
//     return { data: { success: false, msg: "Unknown API endpoint." } };
//   },
// };

export default function ForgotPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string; // Get userId from dynamic route parameter

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"otp" | "password">("otp"); // Initial step is OTP

  // Refs for animation effects
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation effects for the main container
  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.opacity = "1";
        containerRef.current.style.transform = "translateY(0)";
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await Axios.post(`/worker/verify-otp/${userId}`, {
        // userId, // Send userId from params
        otp,
      });

      if (response.data.success) {
        toast.success("OTP verified successfully! Please set your new password.");
        setStep("password"); // Move to password reset step
      } else {
        toast.error(response.data.msg || "Invalid OTP. Please try again.");
      }
    } catch (error: any) {
      console.error("OTP verification error:", userId);
      toast.error("An error occurred during OTP verification. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    try {

      console.log("passs", userId)
      const response = await Axios.post(`/worker/reset-password/${userId}`, {
        // userId, // Send userId from params
        newPassword,
      });

      if (response.data.success) {
        toast.success("Your password has been successfully reset!");
        router.push("/manager/auth/login"); // Redirect to login page
      } else {
        toast.error(response.data.msg || "Failed to reset password. Please try again.");
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error("An error occurred during password reset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden font-inter">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-42 h-42 bg-blue-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-50 h-50 bg-indigo-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-34 h-34 bg-purple-200/20 rounded-full blur-lg animate-bounce"></div>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-4 h-4 bg-blue-400/40 rotate-45 animate-spin-slow"></div>
        <div className="absolute top-40 right-40 w-6 h-6 bg-indigo-400/40 rounded-full animate-bounce delay-500"></div>
        <div className="absolute bottom-32 right-32 w-5 h-5 bg-purple-400/40 rotate-12 animate-pulse delay-700"></div>
      </div>

      {/* Main Container */}
      <div
        className="container mx-auto min-h-screen flex items-center justify-center p-4 lg:p-8"
        ref={containerRef}
        style={{
          opacity: 0,
          transform: "translateY(20px)",
          transition: "all 0.8s ease-out",
        }}
      >
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Section - Brand & Features */}
          <div className="space-y-8 text-center lg:text-left lg:mx-0 -mx-100 order-1 lg:order-1">
      {/* Brand Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
            <LockOpen className="w-8 h-8 text-white" /> {/* Changed icon to LockOpen */}
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ClientSync Pro
            </h2>
            <p className="text-sm text-gray-500">Account Security</p> {/* Changed subtitle */}
          </div>
        </div>

        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
          Secure Your
          <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Account Access
          </span>
        </h1>

        <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0 hidden md:block">
          Follow the steps to securely reset your password and regain access to
          your management portal. Your security is our priority.
        </p>
      </div>

      {/* Feature Cards - Adapted for security focus */}
      <div className="sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 hidden lg:grid">
        <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <UserCog className="w-6 h-6 text-blue-600" /> {/* Changed icon to UserCog */}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                User Account Integrity
              </h3>
              <p className="text-sm text-gray-600">
                Ensuring only you can access and manage your account.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-indigo-600" /> {/* Changed icon to ShieldCheck */}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Enhanced Security Measures
              </h3>
              <p className="text-sm text-gray-600">
                Protecting your data with industry-leading security protocols.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

          {/* Right Section - Forgot Password Form */}
          <div className="w-full max-w-md mx-auto order-2 lg:order-2">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
                  <Lock className="w-8 h-8 text-blue-600" />
                  Password Reset
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  {step === "otp"
                    ? `Enter the 6-digit code sent to your email for User ID: ${userId}`
                    : "Set your new password"}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                {step === "otp" && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Verification Code (OTP)
                      </label>
                      <div className="relative group">
                        <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} // Only allow digits, max 6
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 tracking-widest text-center"
                          maxLength={6}
                          required
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleVerifyOtp}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Verifying OTP...</span>
                        </div>
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>
                  </div>
                )}

                {step === "password" && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        New Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter your new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-12 pr-12 py-3 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Confirm New Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-12 pr-12 py-3 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      onClick={handleResetPassword}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Saving Changes...</span>
                        </div>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                )}

                {/* Support Link */}
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                  <p className="text-sm text-gray-600">
                    Need assistance?{" "}
                    <button className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                      Contact Support
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}