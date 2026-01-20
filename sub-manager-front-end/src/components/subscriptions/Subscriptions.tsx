"use client"

import { useState } from "react";
import { SubscriptionsTable } from "./subscriptions-table";
import { Skeleton } from "../ui/skeleton";
import AddSubscriptionForm from "./AddSubscriptionForm";
import { useDashboardContext } from "../dashboard-context";

const PAGE_SIZE = 10

export default function Subscriptions() {
    const { subscriptions, loadingSubs } = useDashboardContext() 
    const [page, setPage] = useState(1) 

    const safeSubscriptions = subscriptions || [];

    const totalPages = Math.ceil(safeSubscriptions.length / PAGE_SIZE)
    const currentItems = safeSubscriptions.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    )

    return (
        <div className="space-y-6">
            <AddSubscriptionForm />

            <h2 className="text-xl font-semibold">Your Subscriptions</h2>

            {loadingSubs  ? (
                <div className="space-y-2">
                {[...Array(PAGE_SIZE)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                ))}
                </div>
            ) : (
                <>
                <SubscriptionsTable data={currentItems} />
                {safeSubscriptions.length > PAGE_SIZE && (
                     <div className="flex justify-center items-center pt-4">
                        <div className="flex gap-2">
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                            <span className="flex items-center">Page {page} of {totalPages}</span>
                            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )}
                </>
            )}
        </div>
    )
}