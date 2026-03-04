"use client";

import SignupPage from "@/components/ui/Signup";
import { useMutation } from "@tanstack/react-query";
import apiRouter from "@/api/router";
import { useRouter } from "next/navigation";

import type {SignupPayload} from "@/api/signup";

export default function Signup() {

    const router = useRouter();

    const signupMutation = useMutation({
        mutationFn: (payload: SignupPayload) =>
            apiRouter.signup.createUser(payload),
        onSuccess: (data) => {
            router.push("/dashboard");
        },
        onError: (error) => {
            console.error("Login Error:", error);
        },
    });

    return (
        <div className="signup-page">
            <SignupPage onSubmit={(formData) => signupMutation.mutate({user : formData})}
            />
        </div>
    );i

}