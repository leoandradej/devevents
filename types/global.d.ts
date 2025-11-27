declare global {
    type AdminEventRow = {
        _id: string;
        slug: string;
        title: string;
        image: string;
        location: string;
        date: string;
        time: string;
        bookingCount: number;
    }
}

export {}