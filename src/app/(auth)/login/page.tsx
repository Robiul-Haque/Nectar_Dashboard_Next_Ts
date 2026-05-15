"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
// import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAdminLoginMutation } from "@/redux/features/auth/authApi";
import { setCredentials } from "@/redux/features/auth/authSlice";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { setCookie } from "@/lib/cookies";

export default function LoginPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [loginUser, { isLoading }] = useAdminLoginMutation();
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState("");

    // INPUT
    const handleChange = (e: any) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // SUBMIT
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError("");

        if (!form.email || !form.password) {
            setError("All fields are required");
            return;
        }

        if (form.password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        try {
            const res: any = await loginUser(form).unwrap();

            const token = res?.data?.accessToken;

            if (!token) {
                toast.error("Invalid login response");
                return;
            }

            // decode JWT
            const decoded: any = jwtDecode(token);

            const user = {
                id: decoded?.sub,
                role: decoded?.role,
                iat: decoded?.iat,
                exp: decoded?.exp,
            };

            // save redux
            dispatch(
                setCredentials({
                    accessToken: token,
                    user
                })
            );

            // set cookie for middleware
            setCookie("accessToken", token);

            setSuccess(true);

            toast.success("Login successful");

            // redirect
            setTimeout(() => {
                router.push("/dashboard");
            }, 1200);

        } catch (err: any) {
            setError(err?.data?.message || "Login failed");
            toast.error("Login failed");
        }
    };

    const loading = isLoading;

    return (
        <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#eef4ea] dark:bg-[#07130c]">

            {/* BACKGROUND */}
            <div className="absolute -left-32 -top-32 h-85 w-85 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute -bottom-40 -right-40 h-90 w-90 rounded-full bg-green-300/20 blur-3xl" />

            {/* CARD */}
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-4xl border border-white/40 bg-white/70 shadow-[0_20px_80px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0d1c13]/90 lg:grid-cols-[1.1fr_0.9fr]"
            >

                {/* LEFT (UNCHANGED) */}
                <div className="hidden flex-col p-10 lg:flex xl:p-12">

                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-green-600 text-white font-bold">
                            N
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Nectar Admin
                            </h2>
                            <p className="text-sm text-gray-500">
                                Dashboard Console
                            </p>
                        </div>
                    </div>

                    <h1 className="mt-14 text-5xl font-black text-gray-900 dark:text-white">
                        Digital
                        <span className="block text-emerald-600">
                            Control System
                        </span>
                    </h1>

                    <p className="mt-6 text-gray-600 dark:text-gray-300">
                        Secure admin access for managing your ecosystem.
                    </p>

                    <div className="mt-auto relative overflow-hidden rounded-2xl border bg-white/40 dark:bg-white/5">
                        <Image
                            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1600&auto=format&fit=crop"
                            alt="dashboard"
                            width={1200}
                            height={800}
                            className="h-70 w-full object-cover"
                        />

                        <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-xl bg-white/90 px-3 py-2 backdrop-blur">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            <span className="text-sm font-medium">
                                Secure System Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center justify-center p-8 lg:p-12">

                    <div className="w-full max-w-md">

                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white lg:hidden">
                                Nectar Admin
                            </h2>
                            <ThemeToggle />
                        </div>

                        <h1 className="text-4xl font-black text-gray-900 dark:text-white">
                            Welcome back,
                            <span className="block text-emerald-600">
                                Admin
                            </span>
                        </h1>

                        <p className="mt-3 text-sm text-gray-500">
                            Login to access dashboard securely
                        </p>

                        {/* ERROR */}
                        {error && (
                            <p className="mt-4 text-sm text-red-500">
                                {error}
                            </p>
                        )}

                        {/* FORM */}
                        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

                            {/* EMAIL */}
                            <div>
                                <label className="text-sm">Email</label>
                                <div className="relative mt-2">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        type="email"
                                        placeholder="admin@nectar.com"
                                        className="h-14 w-full rounded-2xl border bg-white/80 pl-12 pr-4 outline-none focus:border-emerald-400 dark:bg-white/5"
                                    />
                                </div>
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <label className="text-sm">Password</label>

                                <div className="relative mt-2">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                                    <input
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="********"
                                        minLength={8}
                                        required
                                        className="h-14 w-full rounded-2xl border bg-white/80 pl-12 pr-12 outline-none focus:border-emerald-400 dark:bg-white/5"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2"
                                    >
                                        {showPassword ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                            </div>

                            {/* BUTTON */}
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                disabled={loading || success}
                                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-600 to-green-700 text-white font-semibold shadow-lg"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : success ? (
                                    <>
                                        <CheckCircle2 className="h-5 w-5" />
                                        Success
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        <p className="mt-10 text-center text-xs text-gray-400">
                            © 2026 Nectar Admin Console
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}