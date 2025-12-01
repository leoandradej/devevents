"use server";

import {Event, IEvent} from "@/database";
import connectDB from "../mongodb";

export const getSimilarEventsBySlug = async (slug: string): Promise<IEvent[]> => {
  try {
    await connectDB();

    const event = await Event.findOne({ slug }).lean<IEvent | null>();

    if (!event) return [];

    // MongoDB $ne operator = non equal | $in operator = includes
    const similar =  await Event.find({
      _id: { $ne: (event as any)._id },
      tags: { $in: event.tags },
    }).lean<IEvent[]>();

    return similar;
  } catch (error) {
    console.error("Failed to find similar events: ", error);
    return [];
  }
};
