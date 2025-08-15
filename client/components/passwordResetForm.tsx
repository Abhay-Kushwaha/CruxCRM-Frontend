"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, Lock } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/Axios";
import { toast } from "sonner";

const PasswordResetForm = () => {
    const router = useRouter();
    const { userId } = useParams();

    const [otp, setOtp] = useState("");
    const [verified, setVerified] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleVerifyOtp = async () => {
        try {
            setLoading(true);
            const res = await axios.post(`/worker/verify-otp/${userId}`, {
                otp,
            });

            if (res.data.success) {
                setVerified(true);
                toast.success("OTP verified");
                setError("");
            } else {
                setError("Invalid OTP. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };
      

    const handleCreatePassword = async () => {
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`/worker/reset-password/${userId}`, {
                newPassword,
            });

            if (res.data.success) {
                toast.success("Password successfully reset");
                router.push("/worker/auth/login");
            } else {
                setError("Something went wrong. Try again.");
                toast.error("Something went wrong. Try again.");
            }
        } catch (err) {
            console.error(err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };
      

    return (
        <div className="p-10 max-w-md mx-auto bg-white/80 backdrop-blur-sm border border-gray-100 shadow-xl text-gray-900 flex flex-col justify-center rounded-2xl space-y-5">
            <h2 className="text-2xl font-bold text-gray-900 text-center">Password Reset</h2>
            <p className="text-center text-gray-600">
                Enter the 6-digit OTP sent to your email to verify your identity and reset your password.
            </p>

            {/* OTP Field */}
            {!verified && (
                <div className="relative">
                    <p className="text-gray-600 font-medium">Varification Code (OTP)</p>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            className="w-full pl-10 h-12 border border-gray-200 bg-white text-gray-900 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {error && <p className="text-sm text-red-500 -mt-2">{error}</p>}

            {!verified && (
                <button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full h-12 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200"
                >
                    {loading ? "Verifying..." : "Verify OTP"}
                </button>
            )}

            {/* Password Inputs */}
            {verified && (
                <>
                    {/* New Password */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="New Password"
                            className="w-full pl-10 pr-10 h-12 border border-gray-200 bg-white text-gray-900 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            className="w-full pl-10 pr-10 h-12 border border-gray-200 bg-white text-gray-900 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    <button
                        onClick={handleCreatePassword}
                        disabled={loading}
                        className="w-full mt-2 h-12 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200"
                    >
                        {loading ? "Creating Password..." : "Create Password"}
                    </button>
                </>
            )}
        </div>
    );
};

export default PasswordResetForm;
