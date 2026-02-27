import type z from "zod";
import { FormSchema } from "@/components/SignUpForm";
export type UserDataType = z.infer<typeof FormSchema>;
export type UserDataTypeModified = {
    name: string;
    username: string;
    email: string;
    password: string;
    rePassword: string;
    dateOfBirth: string;
    gender: string;
}

export type UserLoginType = {
    login: string;
    password: string;
}