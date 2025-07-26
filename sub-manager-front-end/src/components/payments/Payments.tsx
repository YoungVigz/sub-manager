"use client"

import { PaymentsTable } from "./payments-table"
import { useDashboardContext } from "../dashboard-context"

export default function Payments() {

    const {payments, subscriptions, loadingPays} = useDashboardContext()

    return (
        <>
            <h2 className="text-xl font-semibold">Your Payments</h2>
            <PaymentsTable payments={payments} subscriptions={subscriptions} />
        </>
    )
}