"use client"

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

const DashboardTable = ({ initialEvents, pageSize = 10, baseEditPath = "/dashboard/events"}: { initialEvents: AdminEvent[]; pageSize?: number; baseEditPath?: string; }) => {
    const [events, setEvents] = useState<AdminEvent[]>(initialEvents ?? []);
    const [page, setPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(events.length / pageSize));
    const pageEvents = useMemo(() => {
        const start = (page - 1) * pageSize;
        return events.slice(start, start + pageSize);
    }, [events, page, pageSize]);

    const handleDelete = async (slug: string) => {
        if (!confirm("Are you sure you want to delete this event? This will also remove its bookings.")) return;

        const prev = events
        setEvents((curr) => curr.filter(e => e.slug !== slug))

        try {
            const res = await fetch(`/api/events/${slug}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete event");

            // To ensure the user doesn't get stuck on an empty page after deletion
            const nextTotalPages = Math.max(1, Math.ceil((prev.length - 1) / pageSize));
            if (page > nextTotalPages) setPage(nextTotalPages);
        } catch (error) {
            console.error("Failed to delete event: ", error);
            alert("Failed to delete event");
            setEvents(prev);
        }
    }

    return (
        <div className="space-y-4 w-full">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">Events</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Booked Spots</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pageEvents.map((event) => (
                            <TableRow key={event._id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-10 w-16 overflow-hidden rounded">
                                            <Image src={event.image} alt={event.title} fill sizes="64px" className="object-cover" />
                                        </div>
                                        <div className="min-w-6">
                                            <Link href={`/events/${event.slug}`} className="line-clamp-1 font-medium cursor-pointer">{event.title}</Link>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">{event.location}</TableCell>
                                <TableCell className="whitespace-nowrap">{event.date}</TableCell>
                                <TableCell className="whitespace-nowrap">{event.time}</TableCell>
                                <TableCell>{event.bookingCount ?? 0}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="icon" aria-label="Edit" title="Edit" className="cursor-pointer hover:bg-primary/40">
                                            <Link
                                                href={`${baseEditPath}/${event.slug}`}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => handleDelete(event.slug)} aria-label="Delete" title="Delete" className="cursor-pointer hover:bg-red-500/60 transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}

                        {pageEvents.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">No Events Found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => setPage(page => Math.max(1, page - 1))}
                    disabled={page <= 1}
                >
                    Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                </span>

                <Button
                    variant="outline"
                    onClick={() => setPage(page => Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}

export default DashboardTable