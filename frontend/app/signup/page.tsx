"use client";

import SignupPage from "@/components/ui/Signup";
import { useMutation } from "@tanstack/react-query";
import apiRouter from "@/api/router";
import { useRouter } from "next/navigation";
import type {SignupPayload} from "@/api/signup";
import React from "react";
import {addToast} from "@heroui/react";

export default function Signup() {

    const router = useRouter();

    const signupMutation = useMutation({
        mutationFn: (payload: SignupPayload) =>
            apiRouter.signup.createUser(payload),
        onSuccess: (data) => {
            router.push("/onboarding");
        },
        onError: (error: any) => {

            addToast({

                title: "Error",
                description: Object.values(error.response.data.errors).flat().join(","),
                timeout: 3000,
                shouldShowTimeoutProgress: true,
                variant: "solid",
                color: "danger",
            });
        },
    });

    return (
        <div className="signup-page">
            <SignupPage onSubmit={(formData) => signupMutation.mutate({user : formData})}
            />
        </div>


    );

}