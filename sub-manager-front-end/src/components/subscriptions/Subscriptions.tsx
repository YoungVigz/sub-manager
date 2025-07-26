"use client"

import { getAuthTokenFromCookie } from "@/utils/auth-functions";
import { useEffect, useState } from "react";
import { SubscriptionsTable } from "./subscriptions-table";
import { Skeleton } from "../ui/skeleton";
import { Pagination } from "../ui/pagination";
import AddSubscriptionForm from "./AddSubscriptionForm";
import { Subscription } from "@/types";

const PAGE_SIZE = 10

export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const [page, setPage] = useState(1)

    useEffect(() => {
        const token = getAuthTokenFromCookie()

        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:8080/api/subscription', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                const data: Subscription[] = await res.json()
                setSubscriptions(data)
                setLoading(false)
            } catch (err) {
                console.error("Błąd podczas pobierania subskrypcji:", err)
                setLoading(false)
            }
        }
        
        fetchData()
    }, [])


    const totalPages = Math.ceil(subscriptions.length / PAGE_SIZE)
    const currentItems = subscriptions.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    )

    return (
        <div className="space-y-6">
            <AddSubscriptionForm />

            <h2 className="text-xl font-semibold">Your Subscriptions</h2>

            {loading ? (
                <div className="space-y-2">
                {[...Array(PAGE_SIZE)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                ))}
                </div>
            ) : (
                <>
                <SubscriptionsTable data={currentItems} />
                <div className="flex justify-center pt-4">
                    <Pagination/>
                </div>
                </>
            )}
        </div>
    )
}