import {cacheLife} from "next/cache";
import Link from "next/link";
import DashboardTable from "@/components/DashboardTable";
import {Button} from "@/components/ui/button";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Dashboard = async () => {
    "use cache"
    cacheLife("minutes");

    const res = await fetch(`${BASE_URL}/api/events/admin`,
        { next: { tags: ["events"], revalidate: 30 },
        });
    const { events } = await res.json();

    return (
        <section>
            <div className="flex flex-col justify-between items-center gap-6">
                <div className="flex flex-col justify-between items-center w-full gap-4 sm:flex-row">
                    <h1>Event Management</h1>
                    <Button className="w-full sm:w-auto text-black">
                        <Link href="/create-event">Add New Event</Link>
                    </Button>
                </div>

                <DashboardTable initialEvents={events as AdminEvent[]} pageSize={10} />
            </div>
        </section>
    )
};


    export default Dashboard;