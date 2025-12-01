"use client"

import {useRouter} from "next/navigation";
import {useState} from "react";
import EventForm from "@/components/forms/EventForm";

const EditEvent = ({
    slug,
    defaults,
                   }: {
    slug: string;
    defaults: EventDefaults;
}) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEdit = async (formData: FormData) => {
        try {
            setIsSubmitting(true)
            const res = await fetch(`/api/events/${slug}`, {
                method: "PATCH",
                body: formData
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data?.message || `Failed to edit event (${res.status})`);
            }
            await router.push("/dashboard");
            router.refresh();
        } catch (error) {
            console.error("Failed to edit event: ", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <EventForm mode="edit" onSubmit={handleEdit} isSubmitting={isSubmitting} defaults={defaults} />
    )
}

export default EditEvent