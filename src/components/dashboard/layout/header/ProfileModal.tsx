"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Camera, Mail, User, Lock, X, LogOut, Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/auth/authSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useUpdateAdminProfileMutation } from "@/redux/features/user/userApi";

interface UserProfile {
    name: string;
    email: string;
    image?: string;
}

interface ProfileModalProps {
    open: boolean;
    onClose: () => void;
    user: UserProfile;
}

export default function ProfileModal({
    open,
    onClose,
    user,
}: ProfileModalProps) {
    const [name, setName] = useState(user.name);
    const [password, setPassword] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ name?: string; password?: string; avatar?: string }>({});

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [updateAdminProfile, { isLoading }] = useUpdateAdminProfileMutation();

    useEffect(() => {
        if (open) {
            setName(user.name);
            setPassword("");
            setSelectedFile(null);
            setPreviewUrl(null);
            setErrors({});
        }
    }, [open, user.name]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (open) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [open, onClose]);

    // Cleanup preview URL to prevent memory leaks
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const initials = useMemo(() => {
        if (!user.name) return "U";

        const parts = user.name.trim().split(/\s+/);

        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }

        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }, [user.name]);

    const dispatch = useDispatch();
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith("image/")) {
            setErrors((prev) => ({ ...prev, avatar: "Only image files are allowed" }));
            toast.error("Only image files are allowed");
            return;
        }

        // Check size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, avatar: "Image size must be less than 5MB" }));
            toast.error("Image size must be less than 5MB");
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setErrors((prev) => ({ ...prev, avatar: undefined }));
    };

    const handleSave = async () => {
        if (isLoading) return;

        const tempErrors: { name?: string; password?: string } = {};

        const trimmedName = name.trim();
        if (!trimmedName) {
            tempErrors.name = "Name is required";
        } else if (trimmedName.length < 2) {
            tempErrors.name = "Name must be at least 2 characters";
        } else if (trimmedName.length > 50) {
            tempErrors.name = "Name cannot exceed 50 characters";
        }

        if (password) {
            if (password.length < 6) {
                tempErrors.password = "Password must be at least 6 characters long";
            } else if (!/[A-Z]/.test(password)) {
                tempErrors.password = "Password must contain at least one capital letter";
            } else if (!/[a-z]/.test(password)) {
                tempErrors.password = "Password must contain at least one small letter";
            } else if (!/[0-9]/.test(password)) {
                tempErrors.password = "Password must contain at least one number";
            } else if (!/[^A-Za-z0-9]/.test(password)) {
                tempErrors.password = "Password must contain at least one special character";
            }
        }

        if (Object.keys(tempErrors).length > 0) {
            setErrors(tempErrors);
            return;
        }

        setErrors({});

        // Determine which fields have changed
        const hasNameChanged = trimmedName !== user.name;
        const hasPasswordChanged = password.length > 0;
        const hasAvatarChanged = selectedFile !== null;

        if (!hasNameChanged && !hasPasswordChanged && !hasAvatarChanged) {
            toast.error("No changes made to update");
            return;
        }

        try {
            const formData = new FormData();
            if (hasNameChanged) formData.append("name", trimmedName);
            if (hasPasswordChanged) formData.append("password", password);
            if (hasAvatarChanged && selectedFile) {
                formData.append("avatar", selectedFile);
            }

            const res = await updateAdminProfile(formData).unwrap();
            toast.success(res.message || "Profile updated successfully");
            onClose();
        } catch (err: any) {
            console.error("[Profile Update Error]", err);
            toast.error(err?.data?.message || "Failed to update profile");
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        onClose();
        toast.success("Logged out successfully");
        router.push("/login");
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={isLoading ? undefined : onClose}
                        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 24 }}
                        transition={{
                            duration: 0.28,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-lg rounded-3xl border border-gray-200/70 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="relative px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="absolute right-4 top-4 p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Profile Settings
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Manage your profile information
                                </p>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-6">
                                {/* Avatar */}
                                <div className="flex flex-col items-center">
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            disabled={isLoading}
                                            className="hidden"
                                        />
                                        {previewUrl || user.image ? (
                                            <Image
                                                src={previewUrl || user.image || ""}
                                                alt={user.name}
                                                width={104}
                                                height={104}
                                                unoptimized={!!previewUrl}
                                                className="w-26 h-26 rounded-3xl object-cover ring-4 ring-emerald-100 dark:ring-emerald-900/40"
                                            />
                                        ) : (
                                            <div className="w-26 h-26 rounded-3xl bg-linear-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                                                {initials}
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            disabled={isLoading}
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            <Camera className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {errors.avatar && (
                                        <p className="mt-2 text-xs text-red-500 font-medium">
                                            {errors.avatar}
                                        </p>
                                    )}

                                    <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                                        {user.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Administrator
                                    </p>
                                </div>

                                {/* Form */}
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={name}
                                                disabled={isLoading}
                                                onChange={(e) => setName(e.target.value)}
                                                className={`w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50 ${
                                                    errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-700"
                                                }`}
                                            />
                                        </div>
                                        {errors.name && (
                                            <p className="mt-1.5 text-xs text-red-500 font-medium pl-1">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={user.email}
                                                readOnly
                                                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="password"
                                                value={password}
                                                disabled={isLoading}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter new password"
                                                className={`w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50 ${
                                                    errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-700"
                                                }`}
                                            />
                                        </div>
                                        {errors.password ? (
                                            <p className="mt-1.5 text-xs text-red-500 font-medium pl-1">
                                                {errors.password}
                                            </p>
                                        ) : (
                                            <p className="mt-1.5 text-2xs text-gray-400 pl-1 leading-relaxed">
                                                Must be at least 6 characters, containing uppercase, lowercase, numbers, and special characters.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between px-6 py-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50">
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>

                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="px-5 py-2.5 rounded-2xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleSave}
                                        disabled={isLoading}
                                        className="px-6 py-2.5 rounded-2xl bg-linear-to-r from-emerald-500 to-green-600 text-white font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 min-w-[130px]"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}