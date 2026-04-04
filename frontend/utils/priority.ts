export const PRIORITY_KEYS = ["Low", "Medium", "High"] as const;
export type PriorityKey = (typeof PRIORITY_KEYS)[number];

export type PriorityOption = {
    key: PriorityKey;
    label: string;
    color: string;
};

const JOB_PRIORITIES: PriorityOption[] = [
    { key: "Low",    label: "Backup", color: "text-muted"    },
    { key: "Medium", label: "Target", color: "text-warning"  },
    { key: "High",   label: "Dream",  color: "text-primary"  },
];

const SCHOOL_PRIORITIES: PriorityOption[] = [
    { key: "Low",    label: "Safety", color: "text-muted"    },
    { key: "Medium", label: "Target", color: "text-warning"  },
    { key: "High",   label: "Reach",  color: "text-primary"  },
];

export function getPriorityOptions(category: string): PriorityOption[] {
    return category === "Graduate School" ? SCHOOL_PRIORITIES : JOB_PRIORITIES;
}

export function getPriorityLabel(priorityKey: string, category: string): string {
    return getPriorityOptions(category).find(o => o.key === priorityKey)?.label ?? priorityKey;
}
