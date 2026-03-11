"use client";

import { useState } from "react";
import {
    Input,
    Button,
    Textarea,
    Chip,
    Divider,
    Avatar,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from "@heroui/react";

/* ───────────────── TYPES ───────────────── */

type FeedbackState = { kind: "success" | "error"; msg: string } | null;

export interface ProfileData {
    preferredName: string;
    contactEmail: string;
    phone: string;
    linkedIn: string;
    portfolio: string;
    bio: string;
}

/* ───────────────── VALIDATION ───────────────── */

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_URL =
    /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
const RE_PHONE = /^\+?[\d\s\-().]{7,20}$/;

export function validate(form: ProfileData): Record<string, string> {
    const e: Record<string, string> = {};

    if (form.contactEmail && !RE_EMAIL.test(form.contactEmail))
        e.contactEmail = "Enter a valid email address";

    if (form.linkedIn && !RE_URL.test(form.linkedIn))
        e.linkedIn = "Enter a valid URL (include https://)";

    if (form.portfolio && !RE_URL.test(form.portfolio))
        e.portfolio = "Enter a valid URL (include https://)";

    if (form.phone && !RE_PHONE.test(form.phone))
        e.phone = "Enter a valid phone number";

    if (form.bio && form.bio.length > 320)
        e.bio = `Bio too long (${form.bio.length}/320 chars)`;

    return e;
}

/* ───────────────── INPUT STYLING ───────────────── */

const inputCN = () => ({
    inputWrapper: `
    border-heroui-border
    bg-heroui-card
    hover:border-heroui-primary/40
    data-[focus=true]:border-heroui-primary
    transition-colors
  `,
    input: "text-heroui-text placeholder:text-heroui-muted text-sm",
    label: "text-heroui-muted text-xs font-mono tracking-wide",
    errorMessage: "text-heroui-danger text-xs",
    description: "text-heroui-muted text-xs mt-0.5",
});

const textareaCN = () => ({
    inputWrapper: `
    border-heroui-border
    bg-heroui-card
    hover:border-heroui-primary/40
    data-[focus=true]:border-heroui-primary
    transition-colors
  `,
    input: "text-heroui-text placeholder:text-heroui-muted text-sm",
    label: "text-heroui-muted text-xs font-mono tracking-wide",
    errorMessage: "text-heroui-danger text-xs",
});

/* ───────────────── CARD ───────────────── */

function SectionCard({
                         eyebrow,
                         title,
                         children,
                     }: {
    eyebrow: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div
            className="
      relative
      bg-heroui-card
      border
      border-heroui-border
      hover:bg-heroui-card_hover
      rounded-2xl
      p-7
      flex flex-col
      gap-5
      transition-colors
      overflow-hidden
    "
        >
            <div className="absolute inset-0 bg-card-glow opacity-40 pointer-events-none" />

            <div className="relative flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <div className="font-mono text-[0.6rem] tracking-[0.2em] text-heroui-muted uppercase">
                        {eyebrow}
                    </div>

                    <h2 className="font-sora text-lg font-bold text-heroui-heading">
                        {title}
                    </h2>
                </div>

                <Divider className="bg-heroui-border/80" />

                {children}
            </div>
        </div>
    );
}

/* ───────────────── IDENTITY ───────────────── */

function IdentityCard({
                          form,
                          errors,
                          set,
                      }: {
    form: ProfileData;
    errors: Record<string, string>;
    set: (k: keyof ProfileData) => (v: string) => void;
}) {
    return (
        <SectionCard eyebrow="Identity" title="Personal Details">
            <div className="flex items-center gap-3">
                <Avatar
                    name={form.preferredName || "?"}
                    size="lg"
                    classNames={{
                        base: "bg-heroui-primary/10 border border-heroui-primary/30 text-heroui-primary font-bold",
                    }}
                />

                <p className="text-xs text-heroui-muted font-sans">
                    Avatar generated from your name
                </p>
            </div>

            <Input
                label="Preferred Name"
                placeholder="What should we call you?"
                value={form.preferredName}
                onValueChange={set("preferredName")}
                variant="bordered"
                classNames={inputCN()}
            />

            <div className="flex flex-col gap-1">
                <Textarea
                    label="Bio"
                    placeholder="Short paragraph about you"
                    value={form.bio}
                    onValueChange={set("bio")}
                    variant="bordered"
                    minRows={3}
                    maxRows={6}
                    isInvalid={!!errors.bio}
                    errorMessage={errors.bio}
                    classNames={textareaCN()}
                />

                <div className="flex justify-end">
          <span
              className={`font-mono text-[0.55rem] tracking-widest ${
                  form.bio.length > 300
                      ? "text-heroui-secondary"
                      : "text-heroui-muted"
              }`}
          >
            {form.bio.length} / 320
          </span>
                </div>
            </div>
        </SectionCard>
    );
}

/* ───────────────── CONTACT ───────────────── */

function ContactCard({
                         form,
                         errors,
                         set,
                     }: {
    form: ProfileData;
    errors: Record<string, string>;
    set: (k: keyof ProfileData) => (v: string) => void;
}) {
    return (
        <SectionCard eyebrow="Contact" title="Contact Details">
            <Input
                label="Contact Email"
                type="email"
                value={form.contactEmail}
                onValueChange={set("contactEmail")}
                isInvalid={!!errors.contactEmail}
                errorMessage={errors.contactEmail}
                variant="bordered"
                classNames={inputCN()}
            />

            <Input
                label="Phone"
                value={form.phone}
                onValueChange={set("phone")}
                isInvalid={!!errors.phone}
                errorMessage={errors.phone}
                variant="bordered"
                classNames={inputCN()}
            />
        </SectionCard>
    );
}

/* ───────────────── LINKS ───────────────── */

function LinksCard({
                       form,
                       errors,
                       set,
                   }: {
    form: ProfileData;
    errors: Record<string, string>;
    set: (k: keyof ProfileData) => (v: string) => void;
}) {
    return (
        <SectionCard eyebrow="Links" title="Online Presence">
            <div className="grid md:grid-cols-2 gap-4">
                <Input
                    label="LinkedIn"
                    value={form.linkedIn}
                    onValueChange={set("linkedIn")}
                    isInvalid={!!errors.linkedIn}
                    errorMessage={errors.linkedIn}
                    variant="bordered"
                    classNames={inputCN()}
                />

                <Input
                    label="Portfolio"
                    value={form.portfolio}
                    onValueChange={set("portfolio")}
                    isInvalid={!!errors.portfolio}
                    errorMessage={errors.portfolio}
                    variant="bordered"
                    classNames={inputCN()}
                />
            </div>
        </SectionCard>
    );
}

/* ───────────────── PAGE ───────────────── */

const DEFAULTS: ProfileData = {
    preferredName: "Jane",
    contactEmail: "jane@email.com",
    phone: "+1 555 000 000",
    linkedIn: "https://linkedin.com",
    portfolio: "https://portfolio.dev",
    bio: "",
};

export default function ProfileEditPage() {
    const [form, setForm] = useState<ProfileData>(DEFAULTS);
    const [saved, setSaved] = useState<ProfileData>(DEFAULTS);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const isDirty = JSON.stringify(form) !== JSON.stringify(saved);

    const set =
        (key: keyof ProfileData) =>
            (v: string) =>
                setForm((p) => ({ ...p, [key]: v }));

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const errs = validate(form);
        setErrors(errs);

        if (Object.keys(errs).length) return;

        setLoading(true);

        await new Promise((r) => setTimeout(r, 900));

        setSaved(form);
        setLoading(false);
    };

    const handleClear = () => setForm(saved);

    return (
        <div className="max-w-6xl mx-auto w-full px-4 flex flex-col gap-6">
            <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-sora font-bold text-heroui-heading">
                        Edit Profile
                    </h1>

                    <p className="text-heroui-muted text-sm">
                        Information visible to recruiters
                    </p>
                </div>

                {isDirty && (
                    <Chip
                        size="sm"
                        classNames={{
                            base: "border-heroui-secondary/30 bg-heroui-secondary/10",
                            content: "text-heroui-secondary text-xs font-mono",
                        }}
                    >
                        Unsaved
                    </Chip>
                )}
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-5">
                <div className="grid md:grid-cols-2 gap-5">
                    <IdentityCard form={form} errors={errors} set={set} />
                    <ContactCard form={form} errors={errors} set={set} />
                </div>

                <LinksCard form={form} errors={errors} set={set} />

                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        onPress={handleClear}
                        isDisabled={!isDirty}
                        className="
            border-heroui-border
            bg-heroui-card
            hover:bg-heroui-card_hover
            text-heroui-text
          "
                    >
                        Discard
                    </Button>

                    <Button
                        type="submit"
                        isLoading={loading}
                        isDisabled={!isDirty}
                        className="
            bg-button-gradient
            text-white
            font-semibold
            border-none
          "
                    >
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}