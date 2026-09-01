import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { setLogin } from "@/api/Auth-User.API";
import type { UserLoginType } from "@/types/validation";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { ShareIcon } from "@/assets/icons/share-icon";
import { Eye, EyeOff, Loader2, Shield, Users, ArrowRight } from "lucide-react";

import { ThemeToggle } from "./ThemeToggle";

export const FormLoginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
        .string()
        .min(1, { message: "Password is required" }),
});

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { setUser, setToken } = useAuthStore();

    const form = useForm<z.infer<typeof FormLoginSchema>>({
        resolver: zodResolver(FormLoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { mutate, isPending } = useMutation({
        mutationKey: ["login"],
        mutationFn: (data: z.infer<typeof FormLoginSchema>) => {
            const fixedData: UserLoginType = {
                login: data.email,
                password: data.password,
            };
            return setLogin(fixedData);
        },
        onMutate: () => {
            toast.loading("Signing you in...", { id: "login-toast" });
        },
        onSuccess: (data) => {
            toast.success("Welcome back!", { id: "login-toast" });
            setUser(data.data);
            setToken(data.data);
            form.reset();
            navigate("/feed", { replace: true });
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || "Invalid email or password. Please try again.";
            toast.error(msg, { id: "login-toast" });
        },
    });

    return (
        <div className={cn("grid min-h-screen lg:grid-cols-2 bg-slate-50 dark:bg-slate-950", className)} {...props}>
            {/* Left Side: Form Container */}
            <div className="flex flex-col justify-between p-6 md:p-10">
                {/* Header / Brand */}
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
                            <ShareIcon size={20} />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                            SocialSphere
                        </span>
                    </Link>
                    <ThemeToggle />
                </div>

                {/* Main Card */}
                <div className="flex flex-1 items-center justify-center my-8">
                    <div className="w-full max-w-sm">
                        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 rounded-3xl p-2 sm:p-4">
                            <CardHeader className="space-y-1">
                                <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                                    Welcome back
                                </CardTitle>
                                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                                    Enter your credentials to access your feed and friends
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit((data) => mutate(data))}
                                        className="space-y-4"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                        Email Address
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="name@example.com"
                                                            type="email"
                                                            className="h-11 rounded-xl text-xs"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs text-red-500" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                        Password
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                type={showPassword ? "text" : "password"}
                                                                placeholder="••••••••"
                                                                className="h-11 rounded-xl pr-10 text-xs"
                                                                {...field}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                                                aria-label="Toggle password visibility"
                                                            >
                                                                {showPassword ? (
                                                                    <EyeOff className="w-4 h-4" />
                                                                ) : (
                                                                    <Eye className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-xs text-red-500" />
                                                </FormItem>
                                            )}
                                        />

                                        <Button
                                            type="submit"
                                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 text-xs transition-all active:scale-98"
                                            disabled={isPending}
                                        >
                                            {isPending ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                                                    <span>Signing in...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Sign In</span>
                                                    <ArrowRight className="w-4 h-4 ml-1.5" />
                                                </>
                                            )}
                                        </Button>

                                        <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-slate-200 dark:after:border-slate-800">
                                            <span className="relative z-10 bg-white dark:bg-slate-900 px-2 text-slate-400 font-medium">
                                                or continue with
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                variant="outline"
                                                className="w-full h-10 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-800"
                                                type="button"
                                                onClick={() => toast.info("Social login simulated")}
                                            >
                                                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                                                    <path
                                                        fill="#4285F4"
                                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                    />
                                                    <path
                                                        fill="#34A853"
                                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                    />
                                                    <path
                                                        fill="#FBBC05"
                                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                                    />
                                                    <path
                                                        fill="#EA4335"
                                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                                    />
                                                </svg>
                                                Google
                                            </Button>

                                            <Button
                                                variant="outline"
                                                className="w-full h-10 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-800"
                                                type="button"
                                                onClick={() => toast.info("Social login simulated")}
                                            >
                                                <svg className="h-4 w-4 mr-2 fill-current" viewBox="0 0 24 24">
                                                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                                                </svg>
                                                Apple
                                            </Button>
                                        </div>

                                        <div className="text-center text-xs text-slate-500 pt-2">
                                            Don&apos;t have an account?{" "}
                                            <Link
                                                to="/signup"
                                                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                Create Account
                                            </Link>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-[11px] text-slate-400">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </div>
            </div>

            {/* Right Side: Hero Visual & Branding */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-900/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="relative z-10 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md border border-white/20">
                        ⚡ Welcome to Next-Gen Social
                    </span>
                </div>

                <div className="relative z-10 max-w-lg space-y-6">
                    <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
                        Share moments. Build real connections.
                    </h1>
                    <p className="text-base text-white/85 leading-relaxed">
                        Join millions worldwide sharing stories, exchanging thoughts, and discovering creative communities in real-time.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                            <Shield className="w-6 h-6 mb-2 text-blue-200" />
                            <h3 className="font-bold text-sm">Privacy First</h3>
                            <p className="text-xs text-white/75 mt-1">Granular control over who sees every post</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                            <Users className="w-6 h-6 mb-2 text-indigo-200" />
                            <h3 className="font-bold text-sm">Global Reach</h3>
                            <p className="text-xs text-white/75 mt-1">Follow creators and expand your horizons</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-xs text-white/60">
                    © 2026 SocialSphere. All rights reserved.
                </div>
            </div>
        </div>
    );
}
