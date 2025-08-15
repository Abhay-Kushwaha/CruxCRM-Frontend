"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import LeftSectionLogin from "../../(component)/LeftSectionLogin";
import Axios from "@/lib/Axios";

export default function ManagerLogin() {
  // State for login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State for forgot password dialog
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isOtpSentConfirmationOpen, setIsOtpSentConfirmationOpen] = useState(false);


  // State for the confirmation dialog when closing forgot password (still needed if they close the email input dialog)
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  // Refs for animation effects
  const containerRef = useRef<HTMLDivElement>(null);
  const floatingShapesRef = useRef<HTMLDivElement>(null);

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

  /**
   * Handles the login form submission.
   * @param {React.FormEvent<HTMLFormElement>} e - The form event.
   */
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Make a POST request to the manager login endpoint using the mock Axios
      const response = await Axios.post("/manager/login", { email, password });
      const data = response.data; // Axios automatically parses JSON

      if (data.success) {
        toast.success("Login successful! Redirecting to dashboard...");

        window.location.replace("/manager/dashboard"); // Commented out for sandbox demo
      } else {
        // Show an error toast if login fails
        toast.error("Login failed: " + (data.msg || "Invalid credentials"));
      }
    } catch (error: any) {
      // Type 'any' for error for broader compatibility
      console.error("Login error:", error);
      // Show a generic error message for network or server issues
      toast.error(
        "Login error: Something went wrong. Please try again. " +
          (error.response?.data?.msg || error.message)
      );
    } finally {
      setIsLoading(false); // Always stop loading, regardless of success or failure
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      toast.error("Please enter your email address");
      return;
    }
    setIsLoading(true); // Start loading for OTP sending process
    try {
      // Make a POST request to the forgot-password endpoint using the mock Axios
      const response = await Axios.post("/worker/forgot-password", {
        email: forgotPasswordEmail,
      });

      if (response.data.success) {
        toast.success("OTP sent to your email!");
        setForgotPasswordOpen(false); // Close the email input dialog
        setIsOtpSentConfirmationOpen(true); // Open the OTP sent confirmation dialog
      } else {
        toast.error(response.data.msg || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const resetForgotPasswordFlow = () => {
    setForgotPasswordEmail("");
    // We don't have otp, newPassword, confirmPassword states for the simplified flow anymore
  };

  const handleConfirmCancelReset = () => {
    setConfirmCancelOpen(false); // Close confirmation dialog
    setForgotPasswordOpen(false); // Close main forgot password dialog
    resetForgotPasswordFlow(); // Reset the flow
  };

  const handleContinueReset = () => {
    setConfirmCancelOpen(false); // Close confirmation dialog
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
      <div
        className="absolute inset-0 pointer-events-none"
        ref={floatingShapesRef}
      >
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
          <LeftSectionLogin />

          {/* Right Section - Login Form */}
          <div className="w-full max-w-md mx-auto order-2 lg:order-2">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-gray-900">
                  Manager Login
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  Enter your credentials to access the management portal
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 ">
                      Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                      <Input
                        type="email"
                        placeholder="manager@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 dark:text-black bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:text-black border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <div className="flex justify-end">
                      {/* Updated Forgot Password button to open the dialog */}
                      <button
                        type="button"
                        onClick={() => setForgotPasswordOpen(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Authenticating...</span>
                      </div>
                    ) : (
                      "Access Manager Portal"
                    )}
                  </Button>
                </form>

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

      {/* Forgot Password Dialog (Email Input Only) */}
      <Dialog
        open={forgotPasswordOpen}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmCancelOpen(true);
            setForgotPasswordOpen(true); // Keep open until user confirms cancellation
          } else {
            setForgotPasswordOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Lock className="w-6 h-6 text-blue-600" />
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Enter your email to receive a verification code
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <Input
                type="email"
                placeholder="manager@company.com"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            <Button
              onClick={handleForgotPassword}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending OTP...</span>
                </div>
              ) : (
                "Send OTP"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for OTP Sent */}
      <Dialog open={isOtpSentConfirmationOpen} onOpenChange={setIsOtpSentConfirmationOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              OTP Sent Successfully
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              A 6-digit OTP has been sent to{" "}
              <span className="font-medium">{forgotPasswordEmail}</span>. Please
              check your email.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl"
              onClick={() => {
                setIsOtpSentConfirmationOpen(false);
                setForgotPasswordOpen(false); // Ensure the main forgot password dialog is closed
                setForgotPasswordEmail(""); // Clear the email for the next attempt
              }}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog when user tries to close the forgot password email dialog */}
      <Dialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Confirm Cancellation
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Are you sure you want to cancel the password reset process? You
              will lose your current progress.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700"
              onClick={handleContinueReset}
            >
              No, Continue
            </Button>
            <Button
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg"
              onClick={handleConfirmCancelReset}
            >
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}