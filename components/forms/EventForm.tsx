"use client"

import {FormEvent, useEffect, useMemo, useState} from "react";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";

const EventForm = ({
    mode,
    defaults = {},
    onSubmit,
    isSubmitting = false,
                   }: {
    mode: "create" | "edit";
    defaults?: EventDefaults;
    onSubmit: (formData: FormData) => Promise<void>;
    isSubmitting?: boolean;
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [tagsCsv, setTagsCsv] = useState<string>((defaults.tags ?? []).join(", "));
    const [agendaText, setAgendaText] = useState<string>((defaults.agenda ?? []).join("\n"));
    // Mode handling: shadcn Select doesn't submit a name, so we mirror it in a hidden input
    const [modeValue, setModeValue] = useState<string>(defaults.mode || "online");

    // Keep local mode in sync if defaults change (e.g., navigating between edits)
    useEffect(() => {
        if (defaults.mode) setModeValue(defaults.mode);
    }, [defaults.mode]);

    const imagePreview = useMemo(() => {
        if (file) return URL.createObjectURL(file);
        return defaults.image || "";
    }, [file, defaults.image]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        console.log(e.currentTarget)

        const tags = (tagsCsv || "")
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);
        const agenda = (agendaText || "")
            .split("\n")
            .map(s => s.trim())
            .filter(Boolean);

        formData.set("tags", JSON.stringify(tags))
        formData.set("agenda", JSON.stringify(agenda))

        // Ensure selected mode is sent with the form
        formData.set("mode", modeValue);

        if (mode === "create" && !formData.get("image")) {
            alert("Image is required")
            return
        }

        if (!modeValue) {
            alert("Please select a mode for the event (online, offline, or hybrid)");
            return;
        }

        await onSubmit(formData);

    }
    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
            <div>
                <div>
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                        id="title"
                        name="title"
                        defaultValue={defaults.title}
                        placeholder="Enter event title"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="description">Event Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        defaultValue={defaults.description}
                        placeholder="Enter event description"
                        required
                        maxLength={1000} />
                </div>

                <div>
                    <Label htmlFor="overview">Event Overview</Label>
                    <Textarea
                        id="overview"
                        name="overview"
                        defaultValue={defaults.overview}
                        placeholder="Enter event overview"
                        maxLength={1000}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="venue">Event Venue</Label>
                    <Input
                        id="venue"
                        name="venue"
                        defaultValue={defaults.venue}
                        placeholder="Enter event venue"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="location">Event Location</Label>
                    <Input
                        id="location"
                        name="location"
                        defaultValue={defaults.location}
                        placeholder="Enter event location"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="date">Event Date</Label>
                    <Input
                        id="date"
                        name="date"
                        type="date"
                        defaultValue={defaults.date}
                        placeholder="Select event date"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="time">Event Time</Label>
                    <Input
                        id="time"
                        name="time"
                        defaultValue={defaults.time}
                        placeholder="HH:MM or HH:MM AM/PM"
                        required
                    />
                </div>


                <div>
                    <Label>Mode</Label>
                    <Select value={modeValue} onValueChange={setModeValue}>
                        <SelectTrigger className="select-btn">
                            <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* Hidden input to ensure the mode is submitted with FormData */}
                    <input type="hidden" name="mode" value={modeValue} />
                </div>

                <div>
                    <Label htmlFor="audience">Event Audience</Label>
                    <Input
                        id="audience"
                        name="audience"
                        defaultValue={defaults.audience}
                        placeholder="Enter event audience"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="organizer">Event Organizer</Label>
                    <Input
                        id="organizer"
                        name="organizer"
                        defaultValue={defaults.organizer}
                        placeholder="Enter event organizer"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="tags">Tags (Comma Separated)</Label>
                    <Input
                        id="tags"
                        name="tags"
                        value={tagsCsv}
                        onChange={e => setTagsCsv(e.target.value)}
                        placeholder="react, nextjs, javascript,..."
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="agenda">Event Agenda (One Item per Line)</Label>
                    <Textarea
                        id="agenda"
                        name="agenda"
                        value={agendaText}
                        onChange={e => setAgendaText(e.target.value)}
                        placeholder={"Intro\nTalk\nQ&A"}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="image">
                        {mode === "create" ? "Image" : "Replace Image (optional)"}
                    </Label>
                    <Input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        required={mode === "create"}
                        onChange={e => setFile(e.target.files?.[0] || null)}
                    />
                    {imagePreview && (
                        <div className="relative h-40 w-full overflow-hidden rounded border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ?
                            (mode === "create" ? "Creating..." : "Saving...") :
                            (mode === "create" ? "Create Event" : "Save Changes")}
                    </Button>
                </div>
            </div>

        </form>
    );
}

export default EventForm