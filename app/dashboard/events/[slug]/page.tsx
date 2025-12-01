import {notFound} from "next/navigation";
import EditEvent from "@/components/EditEvent";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

const EditEventPage = async ({ params }: { params: Promise<{ slug: string }>}) => {
    const { slug } = await params;

    const res = await fetch(`${BASE_URL}/api/events/${slug}`, { next: { revalidate: 0 } });
    if(!res.ok) return notFound();
    const { event } = await res.json();
    if(!event) return notFound();

    const defaults: EventDefaults = {
        title: event.title,
        description: event.description,
        overview: event.overview,
        image: event.image,
        venue: event.venue,
        location: event.location,
        date: event.date,
        time: event.time,
        mode: event.mode,
        audience: event.audience,
        agenda: event.agenda || [],
        organizer: event.organizer,
        tags: event.tags || [],
    };

    return (
        <section id="create-event">
            <h1>Edit Event</h1>
            <EditEvent slug={slug} defaults={defaults} />
        </section>
    )
}

export default EditEventPage