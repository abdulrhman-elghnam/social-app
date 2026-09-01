import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, KeyRound, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { changPassword } from "@/api/Auth-User.API";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export const ResetPasswordSchema = z
    .object({
        password: z.string().min(1, { message: "Current password is required" }),
        newPassword: z
            .string()
            .min(8, { message: "Password must be at least 8 characters" })
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=-])/,
                {
                    message:
                        "Must contain uppercase, lowercase, number, and special character",
                }
            ),
        confirmPassword: z.string().min(1, { message: "Please confirm your new password" }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export default function RestPasswordForm() {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const updateUserData = useAuthStore((state) => state.updateUserData);

    const form = useForm<z.infer<typeof ResetPasswordSchema>>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const newPasswordValue = form.watch("newPassword") || "";

    const criteria = [
        { label: "At least 8 characters", valid: newPasswordValue.length >= 8 },
        { label: "Contains uppercase letter", valid: /[A-Z]/.test(newPasswordValue) },
        { label: "Contains lowercase letter", valid: /[a-z]/.test(newPasswordValue) },
        { label: "Contains number", valid: /\d/.test(newPasswordValue) },
        { label: "Contains special character", valid: /[@$!%*?&#^()_+=-]/.test(newPasswordValue) },
    ];

    const { mutate, isPending } = useMutation({
        mutationFn: (data: z.infer<typeof ResetPasswordSchema>) => {
            return changPassword({
                password: data.password,
                newPassword: data.newPassword,
            });
        },
        onMutate: () => toast.loading("Updating password...", { id: "pw-toast" }),
        onSuccess: (res) => {
            toast.success("Password updated successfully!", { id: "pw-toast" });
            updateUserData(res.data);
            form.reset();
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message || "Failed to update password. Verify current password.";
            toast.error(msg, { id: "pw-toast" });
        },
    });

    return (
        <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Change Password
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Choose a strong password with letters, numbers, and special symbols.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-4 max-w-md">
                    {/* Current Password */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Current Password
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={showCurrent ? "text" : "password"}
                                            placeholder="Enter your current password"
                                            className="h-10 rounded-xl pr-10 text-xs"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrent(!showCurrent)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs text-red-500" />
                            </FormItem>
                        )}
                    />

                    {/* New Password */}
                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    New Password
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={showNew ? "text" : "password"}
                                            placeholder="Create a strong new password"
                                            className="h-10 rounded-xl pr-10 text-xs"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNew(!showNew)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs text-red-500" />
                            </FormItem>
                        )}
                    />

                    {/* Password Strength Checklist */}
                    {newPasswordValue.length > 0 && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1.5 text-xs">
                            <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 block mb-1">
                                Password Requirements:
                            </span>
                            {criteria.map((c) => (
                                <div key={c.label} className="flex items-center gap-1.5">
                                    {c.valid ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    ) : (
                                        <XCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                                    )}
                                    <span className={c.valid ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-500"}>
                                        {c.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Confirm Password */}
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Confirm New Password
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="Re-enter your new password"
                                            className="h-10 rounded-xl pr-10 text-xs"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs text-red-500" />
                            </FormItem>
                        )}
                    />

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold px-5 h-10 shadow-sm shadow-blue-500/20"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                    Updating...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
