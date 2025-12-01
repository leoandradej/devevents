"use server";

import { Booking } from "@/database";
import connectDB from "../mongodb";

export const createBooking = async ({
  eventId,
  email,
}: {
  eventId: string;
  email: string;
}) => {
  try {
    await connectDB();
    await Booking.create({ eventId, email });

    return { success: true };
  } catch (error) {
    console.error("Failed to create a booking: ", error);
    return { success: false };
  }
};
