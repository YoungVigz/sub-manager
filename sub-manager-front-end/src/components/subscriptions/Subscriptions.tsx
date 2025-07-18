"use client"

import { getAuthTokenFromCookie } from "@/utils/auth-functions";
import { useEffect, useState } from "react";


interface Subscription {
    subscriptionId: number
    title: string
    description: string
    price: number
    cycle: string
    dateOfLastPayment: string
    currencyId: number
}


export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [loading, setLoading] = useState<boolean>(true)

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


    if (loading) return <p>Loading...</p>

    return (
        <div>
            Subs
        </div>
    )
}