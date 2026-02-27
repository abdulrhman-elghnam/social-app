import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Link, useNavigate } from "react-router-dom"
import { toast, Toaster } from "sonner"
import { useMutation } from "@tanstack/react-query"
import React from 'react'
import { changPassword } from "@/api123/Auth-User.API"
import { useAuthStore } from "@/store/authStore"

export const ResetPasswordSchema = z.object({
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
            {
                message:
                    "Password must contain uppercase, lowercase, number, and special character",
            }
        ),
    newPassword: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
            {
                message:
                    "Password must contain uppercase, lowercase, number, and special character",
            }
        ),
})

export function RestPasswordForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const form = useForm<z.infer<typeof ResetPasswordSchema>>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: "",
            newPassword: "",
        },
    })

    const nav = useNavigate()

    const { mutate, isPending } = useMutation({
        mutationKey: ["resetPassword"],
        mutationFn: (data: z.infer<typeof ResetPasswordSchema>) => {
            return changPassword(data);
        },
        onSuccess: (res) => {
            console.log(res);
            toast.success("Password reset successfully!")
            toast.dismiss("toastIds")
            updateUser(res.data)
            form.reset()
            setTimeout(() => {
                localStorage.removeItem("auth-storage");
                nav("/login")
            }, 2000);
        },
        onError: (error) => {
            console.log(error);
            toast.error("Failed to reset password")
            toast.dismiss("toastIds")
        },
        onMutate: () => {
            toast.loading("Resetting password...", { id: "toastIds" })
        }
    })
const updateUser = useAuthStore((state) => state.updateUserData) 
    return (
        <>
            <Toaster />
            <div className={cn("grid min-h-svh lg:grid-cols-2", className)} {...props}>
                <div className="flex flex-col gap-4 p-6 md:p-10">
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-sm">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl">Reset Password</CardTitle>
                                    <CardDescription>
                                        Enter your new password below to update your account
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit((data) => { mutate(data) })} className="space-y-6">

                                            <FormField
                                                control={form.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Your Current Password</FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="••••••••" {...field} />
                                                        </FormControl>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="newPassword"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>New Password</FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="••••••••" {...field} />
                                                        </FormControl>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />

                                            <Button type="submit" className={cn("w-full")} disabled={isPending}>
                                                Reset Password
                                            </Button>

                                            <div className="text-center text-sm text-muted-foreground mt-4">
                                                Remember your password?{" "}
                                                <Link to="/login" className="underline underline-offset-4 hover:text-primary">
                                                    Login
                                                </Link>
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
                <div className="bg-primary hidden lg:flex flex-col justify-center items-center text-white p-10">
                    <h1 className="text-4xl font-bold mb-4">
                        Secure your account
                    </h1>
                    <p className="text-lg text-white/90 text-center max-w-md">
                        Update your password to keep your personal information and connections safe.
                    </p>
                </div>
            </div>
        </>
    )
}

export default RestPasswordForm;
