"use client";

import { use, useEffect, useState, FormEvent } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import apiRouter from "@/api/router";
import type { ApplicationPayload } from "@/api/application";

interface PageProps {
    params: Promise<{ id: number }>;
}

export default function EditApplicationPage({ params }: PageProps) {
    const { id: appIdString } = use(params);
    const applicationId = Number(appIdString);

    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const [submitting, setSubmitting] = useState(false);

    const [formState, setFormState] = useState<ApplicationPayload["application"]>({
        id: 0,
        title: "",
        notes: "",
        status: "Applied",
        priority: 0,
        category: ""
    });

    const { title, notes, status, priority, category } = formState;

    /* ---------- GET APPLICATION ---------- */

    const { data: appData, isLoading, refetch } = useQuery({
        queryKey: ["getApplicationById", applicationId],
        queryFn: () => apiRouter.applications.getApplicationById(applicationId),
    });

    const application = appData?.application;

    /* ---------- SET FORM ---------- */

    useEffect(() => {
        if (!application) return;

        setFormState({
            id: application.id,
            title: application.title || "",
            notes: application.notes || "",
            status: application.status || "Applied",
            priority: application.priority ?? 0,
            category: application.category || ""
        });
    }, [application]);

    /* ---------- UPDATE ---------- */

    const updateMutation = useMutation({
        mutationFn: async (payload: typeof formState) => {
            const body: ApplicationPayload = { application: payload };
            return apiRouter.applications.updateApplication(applicationId, body);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getApplications"] });
            refetch();
            setSubmitting(false);
            router.push(`/dashboard?${searchParams.toString()}`);
        },
        onError: (err) => {
            console.error("Update Error:", err);
            setSubmitting(false);
        },
    });

    /* ---------- DELETE ---------- */

    const deleteMutation = useMutation({
        mutationFn: async () =>
            apiRouter.applications.deleteApplication(applicationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getApplications"] });
            router.push(`/dashboard?${searchParams.toString()}`);
        },
        onError: (err) => {
            console.error("Delete Error:", err);
            setSubmitting(false);
        },
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        updateMutation.mutate(formState);
    };

    const handleDelete = () => {
        if (!confirm("Delete this application?")) return;
        setSubmitting(true);
        deleteMutation.mutate();
    };

    /* ---------- UI ---------- */

    if (isLoading) return <div className="p-6">Loading Application...</div>;
    if (!application) return <div className="p-6">Application Not Found</div>;

    return (
        <div className="min-h-screen px-4 py-10 text-slate-100">
            <div className="mx-auto max-w-3xl">

                <header className="mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Edit Application
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Update or delete your job application.
                    </p>
                </header>

                <Card className="bg-table_bg border border-table_border p-6 shadow-lg">
                    <Form className="space-y-6" onSubmit={handleSubmit}>

                        <Input
                            isRequired
                            label="Company / Role"
                            labelPlacement="inside"
                            value={title}
                            onChange={(e) =>
                                setFormState((p) => ({ ...p, title: e.target.value }))
                            }
                        />

                        <Textarea
                            label="Notes"
                            minRows={4}
                            value={notes}
                            onChange={(e) =>
                                setFormState((p) => ({ ...p, notes: e.target.value }))
                            }
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">

                            <Select
                                label="Status"
                                labelPlacement="inside"
                                selectedKeys={[status]}
                                onSelectionChange={(keys) =>
                                    setFormState((p) => ({
                                        ...p,
                                        status: Array.from(keys)[0] as string,
                                    }))
                                }
                            >
                                <SelectItem key="Applied">Applied</SelectItem>
                                <SelectItem key="Interview">Interview</SelectItem>
                                <SelectItem key="Rejected">Rejected</SelectItem>
                                <SelectItem key="Offer">Offer</SelectItem>
                            </Select>

                            <Select
                                label="Category"
                                labelPlacement="inside"
                                selectedKeys={category ? [category] : []}
                                onSelectionChange={(keys) =>
                                    setFormState((p) => ({
                                        ...p,
                                        category: Array.from(keys)[0] as string,
                                    }))
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
                            selectedKeys={[String(priority)]}
                            onSelectionChange={(keys) =>
                                setFormState((p) => ({
                                    ...p,
                                    priority: Number(Array.from(keys)[0]),
                                }))
                            }
                        >
                            <SelectItem key="0">Normal</SelectItem>
                            <SelectItem key="1">Important</SelectItem>
                            <SelectItem key="2">Urgent</SelectItem>
                        </Select>

                        <div className="grid gap-4 w-full grid-cols-1 sm:grid-cols-3">

                            <Button
                                type="button"
                                variant="flat"
                                onPressEnd={() =>
                                    setFormState({
                                        title: application.title || "",
                                        notes: application.notes || "",
                                        status: application.status || "Applied",
                                        priority: application.priority ?? 0,
                                        category: application.category || "",
                                    })
                                }
                            >
                                Reset
                            </Button>

                            <Button
                                type="submit"
                                color="primary"
                                isDisabled={submitting}
                            >
                                {submitting ? "Updating..." : "Update"}
                            </Button>

                            <Button
                                color="danger"
                                variant="flat"
                                onPressEnd={handleDelete}
                            >
                                Delete
                            </Button>

                        </div>

                    </Form>
                </Card>
            </div>
        </div>
    );
}
