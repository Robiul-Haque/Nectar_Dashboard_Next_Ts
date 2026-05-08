"use client";

import { motion } from "framer-motion";

import {
    useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
    Mail,
    Lock,
    Loader2,
} from "lucide-react";

import {
    adminLoginSchema,
    AdminLoginInput,
} from "@/lib/validations/auth.validation";

import {
    useAdminLoginMutation,
} from "@/redux/features/auth/authApi";

export default function LoginForm() {
    const [
        adminLogin,
        { isLoading },
    ] = useAdminLoginMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AdminLoginInput>({
        resolver: zodResolver(
            adminLoginSchema
        ),
    });

    const onSubmit = async (
        data: AdminLoginInput
    ) => {
        try {
            await adminLogin(
                data
            ).unwrap();

            window.location.href =
                "/dashboard";
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <motion.form
            onSubmit={handleSubmit(
                onSubmit
            )}
            initial={{
                opacity: 0,
                y: 20,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.4,
            }}
            className="mt-8 space-y-5"
        >
            {/* Email */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                </label>

                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <input
                        type="email"
                        placeholder="admin@example.com"
                        {...register("email")}
                        className="
                            w-full rounded-2xl border border-gray-200 bg-white/90 py-3 pl-12 pr-4 text-sm text-gray-900 shadow-sm outline-none transition-all
                            focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10
                            dark:border-gray-700 dark:bg-gray-900/80 dark:text-white
                        "
                    />
                </div>

                {errors.email && (
                    <p className="mt-2 text-xs text-red-500">
                        {
                            errors.email
                                .message
                        }
                    </p>
                )}
            </div>

            {/* Password */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                </label>

                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <input
                        type="password"
                        placeholder="••••••••"
                        {...register(
                            "password"
                        )}
                        className="
                            w-full rounded-2xl border border-gray-200 bg-white/90 py-3 pl-12 pr-4 text-sm text-gray-900 shadow-sm outline-none transition-all
                            focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10
                            dark:border-gray-700 dark:bg-gray-900/80 dark:text-white
                        "
                    />
                </div>

                {errors.password && (
                    <p className="mt-2 text-xs text-red-500">
                        {
                            errors.password
                                .message
                        }
                    </p>
                )}
            </div>

            {/* Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="
                    flex h-12 w-full items-center justify-center gap-2 rounded-2xl
                    bg-linear-to-r from-emerald-500 to-green-600
                    font-semibold text-white
                    shadow-lg shadow-emerald-500/20
                    transition-all duration-300
                    hover:scale-[1.01]
                    hover:shadow-xl hover:shadow-emerald-500/30
                    disabled:opacity-70
                "
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Signing In...
                    </>
                ) : (
                    "Sign In"
                )}
            </button>
        </motion.form>
    );
}