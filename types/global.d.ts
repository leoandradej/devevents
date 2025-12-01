declare global {
    type AdminEvent = {
        _id: string;
        slug: string;
        title: string;
        image: string;
        location: string;
        date: string;
        time: string;
        bookingCount: number;
    }

    type EventDefaults = Partial<{
        title: string;
        description: string;
        overview: string;
        image: string;
        venue: string;
        location: string;
        date: string;
        time: string;
        mode: "online" | "offline" | "hybrid" | string;
        audience: string;
        agenda: string[];
        organizer: string;
        tags: string[];
    }>;
}

export {}