"use client";

import { useEffect, useMemo, useState } from "react";
import type { JobApplication, ApplicationStatus } from "./types";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";

const statuses: ApplicationStatus[] = [
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Wishlist",
];

export function AddApplicationModal({
  isOpen,
  onClose,
  onSave,
  initial,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (app: JobApplication) => void;
  initial?: JobApplication | null;
}) {
  const isEdit = !!initial;

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("Applied");
  const [appliedDate, setAppliedDate] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setCompany(initial?.company ?? "");
    setRole(initial?.role ?? "");
    setStatus(initial?.status ?? "Applied");
    setAppliedDate(initial?.appliedDate ?? "");
    setUrl(initial?.url ?? "");
    setNotes(initial?.notes ?? "");
  }, [isOpen, initial]);

  const canSave = useMemo(() => company.trim() && role.trim(), [company, role]);

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => (!open ? onClose() : null)}>
      <ModalContent>
        <ModalHeader>{isEdit ? "Edit Application" : "Add Application"}</ModalHeader>

        <ModalBody className="gap-4">
          <Input
            label="Company"
            placeholder="e.g., Google"
            value={company}
            onValueChange={setCompany}
            isRequired
          />
          <Input
            label="Role"
            placeholder="e.g., Software Engineer"
            value={role}
            onValueChange={setRole}
            isRequired
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Status"
              selectedKeys={[status]}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0] as ApplicationStatus | undefined;
                if (v) setStatus(v);
              }}
            >
              {statuses.map((s) => (
                <SelectItem key={s}>{s}</SelectItem>
              ))}
            </Select>

            <Input
              label="Applied Date"
              type="date"
              value={appliedDate}
              onValueChange={setAppliedDate}
            />
          </div>

          <Input
            label="Job URL"
            placeholder="https://..."
            value={url}
            onValueChange={setUrl}
          />

          <Textarea
            label="Notes"
            placeholder="Anything you want to remember..."
            value={notes}
            onValueChange={setNotes}
          />
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            isDisabled={!canSave}
            onPress={() => {
              const app: JobApplication = {
                id: initial?.id ?? crypto.randomUUID(),
                company: company.trim(),
                role: role.trim(),
                status,
                appliedDate: appliedDate || undefined,
                url: url.trim() || undefined,
                notes: notes.trim() || undefined,
              };
              onSave(app);
              onClose();
            }}
          >
            {isEdit ? "Save" : "Add"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
