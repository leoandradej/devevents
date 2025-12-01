import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import {Booking, Event, IEvent} from "@/database";
import { v2 as cloudinary } from "cloudinary";
import {Types} from "mongoose";
import {revalidateTag} from "next/cache";

function normalizeDate(dateString: string): string {
    const date = new Date(dateString + "T00:00:00.000Z");
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
    }
    return date.toISOString().split("T")[0];
}

function normalizeTime(timeString: string): string {
    const timeRegex = /^(\d{1,2}):(\d{2})(\s*(AM|PM))?$/i;
    const match = timeString.trim().match(timeRegex);
    if (!match) {
        throw new Error("Invalid time format. Use HH:MM or HH:MM AM/PM");
    }
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[4]?.toUpperCase();
    if (period) {
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
    }
    if (hours < 0 || hours > 23 || parseInt(minutes, 10) > 59) {
        throw new Error("Invalid time values");
    }
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

// Define route params type for type safety
type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Connect to database
    await connectDB();

    // Await and extract slug from params
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        { message: "Invalid or missing slug parameter" },
        { status: 400 }
      );
    }

    // Sanitize slug (remove any potential malicious input)
    const sanitizedSlug = slug.trim().toLowerCase();

    // Query events by slug
    const event = await Event
        .findOne({ slug: sanitizedSlug })
        .lean<IEvent & { _id: Types.ObjectId } | null>();

    // Handle events not found
    if (!event) {
      return NextResponse.json(
        { message: `Event with slug '${sanitizedSlug}' not found` },
        { status: 404 }
      );
    }

    const bookingsCount = await Booking.countDocuments({ eventId: event._id });

    // Return successful response with events data
    return NextResponse.json(
      { message: "Event fetched successfully", event: { ...event, bookingsCount } },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching events by slug:", error);
    }

    // Handle specific error types
    if (error instanceof Error) {
      // Handle database connection errors
      if (error.message.includes("MONGODB_URI")) {
        return NextResponse.json(
          { message: "Database configuration error" },
          { status: 500 }
        );
      }

      // Return generic error with error message
      return NextResponse.json(
        { message: "Failed to fetch events", error: error.message },
        { status: 500 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
    try {
        await connectDB();
        const { slug } = await params;
        if (!slug || typeof slug !== "string" || !slug.trim()) {
            return NextResponse.json({ message: "Invalid or missing slug parameter" }, { status: 400 });
        }
        const sanitizedSlug = slug.trim().toLowerCase();

        const formData = await req.formData();
        const patch: Record<string, any> = {}

        for (const [key, value] of formData.entries()) {
            if (key === "tags" || key === "agenda") {
                try {
                    patch[key] = JSON.parse(String(value));
                } catch {
                    return NextResponse.json({ message: `Invalid ${key} format` }, { status: 400 });
                }
            } else if (key !== "image") {
                patch[key] = value
            }
        }

        const file = formData.get("image") as File | null;
        // Only attempt upload if a real file was provided (some browsers include an empty File when no selection)
        if (file && typeof (file as any).size === "number" && (file as any).size > 0) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const uploadResult: any = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream({ resource_type: "image", folder: "DevEvent" }, (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                }).end(buffer);
            });
            patch.image = uploadResult.secure_url;
        }

        if (typeof patch.date === "string"){
            patch.date = normalizeDate(patch.date);
        }
        if (typeof patch.time === "string"){
            patch.time = normalizeTime(patch.time);
        }

        const updated = await Event.findOneAndUpdate(
            { slug: sanitizedSlug },
            patch,
            { new: true, runValidators: true }
        );

        if (!updated) return  NextResponse.json({ message: "Event not found" }, { status: 404 });

        revalidateTag("events", "default")
        return  NextResponse.json({ message: "Event updated", event: updated }, { status: 200 });
    } catch (error) {
        if  (process.env.NODE_ENV === "development") console.error("Error updating event by slug: ", error);
        return NextResponse.json(
            { message: "Update failed", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
    try {
        await connectDB();
        const { slug } = await params;
        if (!slug || typeof slug !== "string" || !slug.trim()) {
            return NextResponse.json({ message: "Invalid or missing slug parameter" }, { status: 400 });
        }

        const sanitizedSlug = slug.trim().toLowerCase();

        const deleted = await Event.findOneAndDelete({ slug: sanitizedSlug });
        if (!deleted) return NextResponse.json({ message: "Event not found"}, { status: 404 });

        // Cascade delete bookings
        await Booking.deleteMany({ eventId: deleted._id });

        revalidateTag("events", "default")
        return NextResponse.json({ message: "Event deleted" }, { status: 200 });
    } catch (error) {
        if (process.env.NODE_ENV === "development") console.error("Error deleting event by slug: ", error);
        return NextResponse.json(
            { message: "Delete failed", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
