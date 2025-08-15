"use client";

import React, { useState, useEffect, useRef } from "react";
import { BookOpen } from "lucide-react";
import PasswordResetForm from "../../../../../../components/passwordResetForm";


export default function ResetPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            formRef.current?.classList.remove("translate-y-10", "opacity-0");
        }, 500);
        return () => clearTimeout(timer);
    }, []);

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
                            Secure Your
                            <span className="block text-blue-600">Account Access</span>
                        </h2>

                        <p className="text-gray-600 text-lg max-w-md">
                            Follow the steps to securely reset your password and regain access to
                        your management portal.
                        </p>
                        <div className="flex gap-10 mt-6">
                            <div className="bg-white p-4 rounded-md shadow">
                                <h3 className="font-semibold text-gray-700">🔒 User Account Integrity</h3>
                                <p className="text-sm text-gray-500">
                                    Ensuring only you can access and manage your account.
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-md shadow">
                                <h3 className="font-semibold text-gray-700">🛡️ Enhanced Security Measures</h3>
                                <p className="text-sm text-gray-500">
                                    Protecting your data with industry-leading security protocols.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center lg:justify-start ml-25">
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
                <PasswordResetForm />
            </div>
        </div>
    );
}
