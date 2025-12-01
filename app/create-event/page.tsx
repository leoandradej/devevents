"use client"

import {useState} from "react";
import { useRouter } from "next/navigation";
import EventForm from "@/components/forms/EventForm";

const CreateEventPage = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateEvent = async (formData: FormData) => {
        try {
            setIsSubmitting(true);
            console.log(formData);
            const res = await fetch("/api/events", { method: "POST", body: formData });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data?.message || `Failed to create event (${res.status})`);
            }

            await router.push("/dashboard");
            router.refresh()
        } catch (error) {
            console.error("Failed to create event: ", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section id="create-event">
            <h1>Create an Event</h1>
            <EventForm mode="create" onSubmit={handleCreateEvent} isSubmitting={isSubmitting} />
        </section>
    )
}

export default CreateEventPage