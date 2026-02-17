"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Card,
    Button,
    Input,
    Textarea,
    Form,
    Select,
    SelectItem,
} from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import apiRouter from "@/api/router";

export default function NewApplicationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const [submitting, setSubmitting] = useState(false);

    // Controlled state
    const [status, setStatus] = useState("Applied");
    const [priority, setPriority] = useState("0");
    const [category, setCategory] = useState("");

    const createMutation = useMutation({
        mutationFn: async (formData: Record<string, any>) => {
            return apiRouter.applications.createApplication({
                application: {
                    title: formData.title,
                    notes: formData.notes,
                    status: status,
                    priority: Number(priority),
                    category: category,
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getApplications"] });
            router.push(`/dashboard?${searchParams.toString()}`);
        },
        onError: (err) => {
            console.error("Create Application Error:", err);
            setSubmitting(false);
        },
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = Object.fromEntries(new FormData(e.currentTarget));
        createMutation.mutate(formData);
    };

    return (
        <div className="min-h-screen px-4 py-10 text-slate-100">
            <div className="mx-auto max-w-3xl">

                <header className="mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        New Application
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Add a new job application to your tracker.
                    </p>
                </header>

                <Card className="bg-table_bg border border-table_border p-6 shadow-lg">
                    <Form className="space-y-6" onSubmit={handleSubmit}>

                        <Input
                            isRequired
                            label="Company / Role"
                            labelPlacement="inside"
                            name="title"
                            placeholder="e.g. Google Internship"
                        />

                        <Textarea
                            label="Notes"
                            name="notes"
                            placeholder="Interview details, contacts, deadlines..."
                            minRows={4}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">

                            <Select
                                label="Status"
                                labelPlacement="inside"
                                selectedKeys={[status]}
                                onSelectionChange={(keys) =>
                                    setStatus(Array.from(keys)[0] as string)
                                }
                            >
                                <SelectItem key="Applied">Applied</SelectItem>
                                <SelectItem key="Interview">Interview</SelectItem>
                                <SelectItem key="Offer">Offer</SelectItem>
                                <SelectItem key="Rejected">Rejected</SelectItem>
                            </Select>

                            <Select
                                label="Category"
                                labelPlacement="inside"
                                selectedKeys={category ? [category] : []}
                                onSelectionChange={(keys) =>
                                    setCategory(Array.from(keys)[0] as string)
                                }
                            >
                                <SelectItem key="Internship">Internship</SelectItem>
                                <SelectItem key="Full-time">Full-time</SelectItem>
                                <SelectItem key="Research">Research</SelectItem>
                                <SelectItem key="Other">Other</SelectItem>
                            </Select>

                        </div>

                        <Select
                            label="Priority"
                            labelPlacement="inside"
                            selectedKeys={[priority]}
                            onSelectionChange={(keys) =>
                                setPriority(Array.from(keys)[0] as string)
                            }
                        >
                            <SelectItem key="0">Normal</SelectItem>
                            <SelectItem key="1">Important</SelectItem>
                            <SelectItem key="2">Urgent</SelectItem>
                        </Select>

                        <Button
                            type="submit"
                            color="primary"
                            className="w-full"
                            isDisabled={submitting}
                        >
                            {submitting ? "Creating..." : "Create Application"}
                        </Button>

                    </Form>
                </Card>
            </div>
        </div>
    );
}
