"use client";

import { useState } from "react";
import {
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button,
} from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToast } from "@heroui/react";
import apiRouter from "@/api/router";
import { getPriorityOptions } from "@/utils/priority";

const STATUS_OPTIONS   = ["Wishlist", "Applied", "Under Review", "Awaiting Decision", "Interview", "Offer", "Rejected"] as const;
const CATEGORY_OPTIONS = ["Internship", "Full-time", "Graduate School", "Fellowship", "Research", "Other"] as const;

const inputCls = [
    "w-full rounded-xl border border-border/50 bg-foreground/[0.04] px-4 py-2.5 text-sm text-foreground",
    "placeholder:text-muted/40 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-colors",
].join(" ");

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export function AddApplicationModal({ isOpen, onClose }: Props) {
    const queryClient = useQueryClient();

    const [company,  setCompany]  = useState("");
    const [position, setPosition] = useState("");
    const [status,   setStatus]   = useState<string>("Applied");
    const [category, setCategory] = useState<string>("");
    const [priority, setPriority] = useState<string>("Low");
    const [salary,   setSalary]   = useState<string>("");

    const reset = () => {
        setCompany(""); setPosition(""); setStatus("Applied"); setCategory(""); setPriority("Low"); setSalary("");
    };

    const handleClose = () => { reset(); onClose(); };

    const createMutation = useMutation({
        mutationFn: () =>
            apiRouter.applications.createApplication({
                application: { company: company.trim(), position: position.trim() || undefined, status, category, priority, salary: salary ? Number(salary) : null },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getApplications"] });
            addToast({
                title:       "Application added",
                description: `"${company.trim()}" has been saved.`,
                color:       "success",
                timeout:     3000,
                shouldShowTimeoutProgress: true,
            });
            handleClose();
        },
        onError: () => {
            addToast({
                title:       "Something went wrong",
                description: "Please try again.",
                color:       "danger",
                timeout:     4000,
                shouldShowTimeoutProgress: true,
            });
        },
    });

    const canSave = company.trim().length > 0;

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={open => !open && handleClose()}
            size="lg"
            classNames={{
                base:   "bg-card border border-border/50 backdrop-blur-2xl",
                header: "border-b border-border/30",
                footer: "border-t border-border/30",
            }}
        >
            <ModalContent>
                <ModalHeader className="font-sora font-extrabold text-heading text-[1.05rem]">
                    New Application
                </ModalHeader>

                <ModalBody className="flex flex-col gap-4 py-5">

                    {/* Company + Position */}
                    <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                        <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[0.6rem] tracking-[0.16em] uppercase text-muted/60">
                                Company <span className="text-danger">*</span>
                            </label>
                            <input
                                autoFocus
                                value={company}
                                onChange={e => setCompany(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter" && canSave) createMutation.mutate(); }}
                                placeholder="e.g. Google"
                                className={inputCls}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[0.6rem] tracking-[0.16em] uppercase text-muted/60">Position</label>
                            <input
                                value={position}
                                onChange={e => setPosition(e.target.value)}
                                placeholder="e.g. SWE Intern"
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {/* Status + Category */}
                    <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                        <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[0.6rem] tracking-[0.16em] uppercase text-muted/60">Status</label>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                className={inputCls}
                            >
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[0.6rem] tracking-[0.16em] uppercase text-muted/60">Category</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className={inputCls}
                            >
                                <option value="">Select…</option>
                                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Salary */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[0.6rem] tracking-[0.16em] uppercase text-muted/60">Salary</label>
                        <input
                            type="number"
                            min="0"
                            value={salary}
                            onChange={e => setSalary(e.target.value)}
                            placeholder="e.g. 85000"
                            className={inputCls}
                        />
                    </div>

                    {/* Priority */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[0.6rem] tracking-[0.16em] uppercase text-muted/60">Priority</label>
                        <div className="flex gap-2">
                            {getPriorityOptions(category).map(({ key, label, color }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setPriority(key)}
                                    className={[
                                        "flex-1 py-2 rounded-xl text-xs font-semibold border transition-all duration-150",
                                        priority === key
                                            ? `border-primary/50 bg-primary/10 ${color}`
                                            : "border-border/50 bg-foreground/[0.04] text-muted hover:border-primary/30",
                                    ].join(" ")}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                </ModalBody>

                <ModalFooter>
                    <Button
                        variant="bordered"
                        onPress={handleClose}
                        className="border-border/50 bg-foreground/[0.03] text-muted hover:bg-foreground/[0.07] hover:text-subheading"
                    >
                        Cancel
                    </Button>
                    <Button
                        isDisabled={!canSave}
                        isLoading={createMutation.isPending}
                        onPress={() => createMutation.mutate()}
                        variant="bordered"
                        className="border-primary/30 bg-primary/10 text-foreground hover:bg-primary/20 hover:border-primary/55 font-bold disabled:opacity-40"
                    >
                        Add Application
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
