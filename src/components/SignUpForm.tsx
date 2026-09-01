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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Eye, EyeOff, Loader2, Sparkles, Users, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { setSignUp } from "@/api/Auth-User.API";
import type { UserDataTypeModified } from "@/types/validation";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShareIcon } from "@/assets/icons/share-icon";
import { ThemeToggle } from "./ThemeToggle";

export const FormSchema = z
    .object({
        name: z
            .string()
            .min(3, { message: "Name must be at least 3 characters" })
            .regex(/^[a-zA-Z]+ [a-zA-Z]+$/, "Please enter your full name (First Last)")
            .max(50, { message: "Name must be less than 50 characters" }),
        username: z
            .string()
            .regex(/^[a-zA-Z0-9_]{3,16}$/, "Username must be 3-16 characters (letters, numbers, underscores)"),
        email: z.string().email({ message: "Invalid email address" }),
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters" })
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=-])/,
                {
                    message:
                        "Must contain uppercase, lowercase, number, and special character",
                }
            ),
        rePassword: z.string().min(1, { message: "Please confirm your password" }),
        dateOfBirth: z.date({ error: "Date of birth is required" }).refine(
            (date) => {
                const todayYear = new Date().getFullYear();
                const dateChoose = date.getFullYear();
                return todayYear - dateChoose >= 16;
            },
            {
                message: "You must be at least 16 years old to register",
            }
        ),
        gender: z.enum(["male", "female"], { error: "Please select your gender" }),
    })
    .refine((data) => data.password === data.rePassword, {
        message: "Passwords do not match",
        path: ["rePassword"],
    });

export function SignUpForm({ className, ...props }: React.ComponentProps<"div">) {
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            username: "",
            email: "",
            password: "",
            rePassword: "",
            gender: undefined,
        },
    });

    const { mutate, isPending } = useMutation({
        mutationKey: ["signUp"],
        mutationFn: (data: z.infer<typeof FormSchema>) => {
            const fixedData: UserDataTypeModified = {
                name: data.name,
                username: data.username,
                email: data.email,
                password: data.password,
                rePassword: data.rePassword,
                dateOfBirth: data.dateOfBirth.toLocaleDateString("en-CA"),
                gender: data.gender,
            };
            return setSignUp(fixedData);
        },
        onMutate: () => {
            toast.loading("Creating your account...", { id: "signup-toast" });
        },
        onSuccess: () => {
            toast.success("Account created successfully! Please sign in.", { id: "signup-toast" });
            form.reset();
            setTimeout(() => {
                navigate("/login");
            }, 1000);
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || "Registration failed. Please verify your details.";
            toast.error(msg, { id: "signup-toast" });
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
                <div className="flex flex-1 items-center justify-center my-6">
                    <div className="w-full max-w-md">
                        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 rounded-3xl p-2 sm:p-4">
                            <CardHeader className="space-y-1">
                                <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                                    Create an account
                                </CardTitle>
                                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                                    Fill in your details below to join the community
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit((data) => mutate(data))}
                                        className="space-y-3.5"
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                            Full Name
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="John Doe" className="h-10 rounded-xl text-xs" {...field} />
                                                        </FormControl>
                                                        <FormMessage className="text-[11px] text-red-500" />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="username"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                            Username
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="johndoe" className="h-10 rounded-xl text-xs" {...field} />
                                                        </FormControl>
                                                        <FormMessage className="text-[11px] text-red-500" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

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
                                                            className="h-10 rounded-xl text-xs"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[11px] text-red-500" />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                                                    className="h-10 rounded-xl pr-8 text-xs"
                                                                    {...field}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                                >
                                                                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                                </button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-[11px] text-red-500" />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="rePassword"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                            Confirm
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    type={showRePassword ? "text" : "password"}
                                                                    placeholder="••••••••"
                                                                    className="h-10 rounded-xl pr-8 text-xs"
                                                                    {...field}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowRePassword(!showRePassword)}
                                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                                >
                                                                    {showRePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                                </button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-[11px] text-red-500" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <FormField
                                                control={form.control}
                                                name="dateOfBirth"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                            Date of Birth
                                                        </FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant="outline"
                                                                        className={cn(
                                                                            "w-full h-10 pl-3 text-left font-normal rounded-xl text-xs",
                                                                            !field.value && "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        {field.value ? (
                                                                            format(field.value, "dd MMM yyyy")
                                                                        ) : (
                                                                            <span>Select date</span>
                                                                        )}
                                                                        <CalendarIcon className="ml-auto h-3.5 w-3.5 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0 rounded-2xl" align="center">
                                                                <Calendar
                                                                    mode="single"
                                                                    captionLayout="dropdown"
                                                                    selected={field.value}
                                                                    onSelect={field.onChange}
                                                                    disabled={(date) =>
                                                                        date > new Date() || date < new Date("1920-01-01")
                                                                    }
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormMessage className="text-[11px] text-red-500" />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="gender"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                            Gender
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <SelectTrigger className="w-full h-10 rounded-xl text-xs capitalize">
                                                                    <SelectValue placeholder="Select gender" />
                                                                </SelectTrigger>
                                                                <SelectContent className="rounded-xl">
                                                                    <SelectGroup>
                                                                        <SelectItem value="male">Male</SelectItem>
                                                                        <SelectItem value="female">Female</SelectItem>
                                                                    </SelectGroup>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage className="text-[11px] text-red-500" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 text-xs transition-all active:scale-98 mt-2"
                                            disabled={isPending}
                                        >
                                            {isPending ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                                                    <span>Creating Account...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Create Account</span>
                                                    <ArrowRight className="w-4 h-4 ml-1.5" />
                                                </>
                                            )}
                                        </Button>

                                        <div className="text-center text-xs text-slate-500 pt-2">
                                            Already have an account?{" "}
                                            <Link
                                                to="/login"
                                                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                Sign In
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
                    By signing up, you agree to our Terms of Service and Privacy Policy.
                </div>
            </div>

            {/* Right Side: Hero Visual & Branding */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-900/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="relative z-10 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md border border-white/20">
                        ✨ Connect with the World
                    </span>
                </div>

                <div className="relative z-10 max-w-lg space-y-6">
                    <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
                        Start your journey today.
                    </h1>
                    <p className="text-base text-white/85 leading-relaxed">
                        Create an account in seconds and unlock an intuitive, lightning-fast social experience designed for creators and storytellers.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                            <Sparkles className="w-6 h-6 mb-2 text-blue-200" />
                            <h3 className="font-bold text-sm">Instant Publishing</h3>
                            <p className="text-xs text-white/75 mt-1">Upload high-res photos and formatted text effortlessly</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                            <Users className="w-6 h-6 mb-2 text-indigo-200" />
                            <h3 className="font-bold text-sm">Active Communities</h3>
                            <p className="text-xs text-white/75 mt-1">Engage with creators sharing your passions</p>
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
