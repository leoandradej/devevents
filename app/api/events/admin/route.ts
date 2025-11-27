import  { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Event, Booking } from "@/database";

export async function GET() {
    try {
        await connectDB();

        const events = await Event.aggregate([
            {
                $lookup: {
                    from: Booking.collection.name,
                    localField: "_id",
                    foreignField: "eventId",
                    as: "bookings",
                },
            },
            { $addFields: { bookingCount: { $size: "$bookings" } } },
            { $project: { bookings: 0 } },
            { $sort: { createdAt: -1 }},
        ])

        return NextResponse.json({ events }, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { message: "Failed to fetch events with counts", error: error },
            { status: 500 }
        )
    }
}