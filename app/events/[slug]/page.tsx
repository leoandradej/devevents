import EventDetails from "@/components/EventDetails";
import { Suspense } from "react";

const EventDetailsContent = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    return <EventDetails slug={slug} />;
}

const EventDetailsPage = ({ params }: { params: Promise<{ slug: string }> }) => {
    return (
        <main>
            <Suspense fallback={<div className="p-6">Loading...</div>}>
                <EventDetailsContent params={params} />
            </Suspense>
        </main>
    );
}

export default EventDetailsPage;