
import React from "react";
import {Button, Input, Form, addToast} from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import apiRouter from "@/api/router";

import type { LoginPayload } from "@/api/session";

export default function LoginView({ onLoginSuccess }: { onLoginSuccess: () => void }) {

    const [isVisible, setIsVisible] = React.useState(false);
    const toggleVisibility = () => setIsVisible((v) => !v);


    const loginMutation = useMutation({
        mutationFn: (payload: LoginPayload) =>
            apiRouter.sessions.createSession(payload),
        onSuccess: (data : any) => {
            addToast({
                title: "Success",
                description: "Login Successful!",
                timeout: 1000,
                shouldShowTimeoutProgress: true,
                variant: "solid",
                color: "success",
            });

            chrome.storage.local.set({ jwtToken: data.token }).then(() => {
                onLoginSuccess();
            });
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

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const payload: LoginPayload = {
            email_address: formData.get("email")!.toString().toLowerCase(),
            password: formData.get("password")!.toString(),
        };
        loginMutation.mutate(payload);
    };

    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="rounded-large flex w-full max-w-sm flex-col gap-4">
                <div className="flex flex-col items-center pb-6">
                    <p className="text-xl font-medium">Welcome</p>
                    <p className="text-small text-default-500">
                        Log in to your account to continue
                    </p>
                </div>

                <Form
                    className="flex flex-col gap-3"
                    validationBehavior="native"
                    onSubmit={handleSubmit}
                >
                    <Input
                        isRequired
                        label="Email Address"
                        name="email"
                        placeholder="Enter your email"
                        type="email"
                        variant="bordered"
                    />
                    <Input
                        isRequired
                        name="password"
                        label="Password"
                        placeholder="Enter your password"
                        type={isVisible ? "text" : "password"}
                        variant="bordered"
                        endContent={
                            <button type="button" onClick={toggleVisibility}>
                            </button>
                        }
                    />
                    <Button
                        className="w-full"
                        color="primary"
                        type="submit"
                        isLoading={loginMutation.isPending}
                    >
                        Sign In
                    </Button>
                </Form>
            </div>
        </div>
    );
}