"use client"

import { PaymentsTable } from "./payments-table"
import { useDashboardContext } from "../dashboard-context"
import { Skeleton } from "../ui/skeleton"

export default function Payments() {

    const {payments, subscriptions, loadingPays} = useDashboardContext()

    return (
        <>
            <h2 className="text-xl font-semibold">Your Payments</h2>
            {loadingPays ? (
                 <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            ) : (
                <PaymentsTable payments={payments} subscriptions={subscriptions} />
            )}
        </>
    )
}