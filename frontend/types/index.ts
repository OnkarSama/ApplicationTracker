import type * as React from "react";

export type IconSvgProps = React.SVGProps<SVGSVGElement> & {
    size?: number;
    width?: number;
    height?: number;
};

export type ApplicationStatus =
    | "Wishlist"
    | "Applied"
    | "Under Review"
    | "Awaiting Decision"
    | "Interview"
    | "Offer"
    | "Rejected";

export type Filter = "open" | "in-progress" | "closed" | "all";

export type Application = {

    application: {
        id: number
        company: string,
        position?: string,
        notes: string,
        status: string,
        priority: string

    };
}
