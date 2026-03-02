"use client";

import type { JobApplication, ApplicationPriority } from "./types";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";

function statusColor(status: JobApplication["status"]) {
  switch (status) {
    case "Applied":    return "primary";
    case "Interview":  return "warning";
    case "Offer":      return "success";
    case "Rejected":   return "danger";
    default:           return "default";
  }
}

function priorityColor(priority: ApplicationPriority): "danger" | "warning" | "default" {
  switch (priority) {
    case "High":   return "danger";
    case "Medium": return "warning";
    case "Low":    return "default";
  }
}

function priorityLabel(priority: ApplicationPriority) {
  switch (priority) {
    case "High":   return "↑ High";
    case "Medium": return "→ Med";
    case "Low":    return "↓ Low";
  }
}

export function ApplicationTable({
  apps,
  onDelete,
  onEdit,
}: {
  apps: JobApplication[];
  onDelete: (id: string) => void;
  onEdit: (app: JobApplication) => void;
}) {
  return (
    <Table aria-label="Applications table" removeWrapper>
      <TableHeader>
        <TableColumn>Company</TableColumn>
        <TableColumn>Role</TableColumn>
        <TableColumn>Status</TableColumn>
        <TableColumn>Priority</TableColumn>
        <TableColumn>Salary</TableColumn>
        <TableColumn>Applied</TableColumn>
        <TableColumn>Link</TableColumn>
        <TableColumn className="text-right">Actions</TableColumn>
      </TableHeader>

      <TableBody emptyContent="No applications found. Try adjusting your filters.">
        {apps.map((a) => (
          <TableRow key={a.id}>
            <TableCell className="font-medium">{a.company}</TableCell>
            <TableCell>{a.role}</TableCell>
            <TableCell>
              <Chip color={statusColor(a.status)} variant="flat" size="sm">
                {a.status}
              </Chip>
            </TableCell>
            <TableCell>
              <Chip color={priorityColor(a.priority)} variant="flat" size="sm">
                {priorityLabel(a.priority)}
              </Chip>
            </TableCell>
            <TableCell>
              <span className="font-medium text-success-600">
                {a.salary || <span className="text-default-300">—</span>}
              </span>
            </TableCell>
            <TableCell>{a.appliedDate || <span className="text-default-300">—</span>}</TableCell>
            <TableCell>
              {a.url ? (
                <Link href={`/dashboard/applications/${a.id}`}>View</Link>
              ) : (
                <span className="text-default-300">—</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="flat" onPress={() => onEdit(a)}>
                  Edit
                </Button>
                <Button size="sm" color="danger" variant="flat" onPress={() => onDelete(a.id)}>
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}