"use client";
import { useEffect, useMemo, useState } from "react";
import type { JobApplication, ApplicationStatus, ApplicationPriority } from "./types";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Input, Textarea,
} from "@heroui/react";

const statuses: ApplicationStatus[] = ["Applied", "Interview", "Offer", "Rejected", "Wishlist"];
const priorities: ApplicationPriority[] = ["High", "Medium", "Low"];

const nativeSelectStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 8,
  border: "2px solid #e2e8f0",
  background: "#f8fafc",
  padding: "8px 12px",
  fontSize: 14,
  color: "#0f172a",
  outline: "none",
  cursor: "pointer",
  fontFamily: "inherit",
};

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
  const [company, setCompany]       = useState("");
  const [role, setRole]             = useState("");
  const [location, setLocation]     = useState("");
  const [status, setStatus]         = useState<ApplicationStatus>("Applied");
  const [priority, setPriority]     = useState<ApplicationPriority>("Medium");
  const [salary, setSalary]         = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [url, setUrl]               = useState("");
  const [notes, setNotes]           = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setCompany(initial?.company ?? "");
    setRole(initial?.role ?? "");
    setLocation(initial?.location ?? "");
    setStatus(initial?.status ?? "Applied");
    setPriority(initial?.priority ?? "Medium");
    setSalary(initial?.salary ?? "");
    setAppliedDate(initial?.appliedDate ?? "");
    setUrl(initial?.url ?? "");
    setNotes(initial?.notes ?? "");
  }, [isOpen, initial]);

  const canSave = useMemo(() => company.trim() && role.trim(), [company, role]);

  function handleSave() {
    if (!canSave) return;
    const app: JobApplication = {
      id: initial?.id ?? crypto.randomUUID(),
      company: company.trim(),
      role: role.trim(),
      location: location.trim() || undefined,
      status,
      priority,
      salary: salary.trim() || undefined,
      appliedDate: appliedDate || undefined,
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    onClose();
    onSave(app);
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => (!open ? onClose() : null)} size="lg">
      <ModalContent>
        <ModalHeader>{isEdit ? "Edit Application" : "Add Application"}</ModalHeader>
        <ModalBody className="gap-4">

          {/* Company + Role */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Company" placeholder="e.g., Google" value={company} onValueChange={setCompany} isRequired />
            <Input label="Role" placeholder="e.g., Software Engineer" value={role} onValueChange={setRole} isRequired />
          </div>

          {/* Location */}
          <Input label="Location" placeholder="e.g., Remote, New York, NY" value={location} onValueChange={setLocation} />

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-default-500">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as ApplicationStatus)} style={nativeSelectStyle}>
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-default-500">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as ApplicationPriority)} style={nativeSelectStyle}>
                {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Salary + Date */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Salary" placeholder="e.g., $120,000" value={salary} onValueChange={setSalary} />
            <Input label="Applied Date" type="date" value={appliedDate} onValueChange={setAppliedDate} />
          </div>

          {/* URL */}
          <Input label="Job URL" placeholder="https://..." value={url} onValueChange={setUrl} />

          {/* Notes */}
          <Textarea label="Notes" placeholder="Anything you want to remember..." value={notes} onValueChange={setNotes} />

        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>Cancel</Button>
          <Button color="primary" isDisabled={!canSave} onPress={handleSave}>
            {isEdit ? "Save Changes" : "Add Application"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}