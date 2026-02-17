export type ApplicationStatus =
    | "Applied"
    | "Interview"
    | "Offer"
    | "Rejected"
    | "Wishlist";

export type Filter = "open" | "in-progress" | "closed" | "all";

export type Application = {

    application: {
        id: number
        title: string,
        notes: string,
        status: string,
        priority: number

    };
}
