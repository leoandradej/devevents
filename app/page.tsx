import EventCard from "@/components/EventCard";
import ExploreButton from "@/components/ExploreButton";
import { IEvent } from "@/database";
import { cacheLife } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Page = async () => {
  "use cache";
  cacheLife("hours");

  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not defined");
  }

  const response = await fetch(`${BASE_URL}/api/events`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`);
  }

  const { events } = await response.json();

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can&apos;t Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferences, All in One Place
      </p>

      <ExploreButton />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        <ul className="events">
          {events &&
            events.length > 0 &&
            events.map((event: IEvent) => (
              <li key={event.title} className="list-none">
                <EventCard {...event} />
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
};

export default Page;
