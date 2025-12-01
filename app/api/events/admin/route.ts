import {NextRequest, NextResponse} from "next/server";
import connectDB from "@/lib/mongodb";
import { Event, Booking } from "@/database";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, Number(searchParams.get("page")) || 1);
        const limit = Math.min(100, Number(searchParams.get("limit")) || 10);
        const skip = (page - 1) * limit;
        const [rows, total] = await Promise.all([
            Event.aggregate([
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
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
            ]),
            Event.countDocuments(),
        ]);

        return NextResponse.json(
            { events: rows, page, limit, total, totalPages: Math.ceil(total / limit) },
            { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { message: "Failed to fetch events with counts", error: error },
            { status: 500 }
        )
    }
}