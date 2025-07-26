"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Payment, Status, Subscription } from "@/types"

export function PaymentsTable({ payments, subscriptions }: { payments: Payment[], subscriptions: Subscription[]}) {

    const today = new Date()

    const sortedData = [...payments].sort((a, b) => {
        if (a.status == Status.UNPROCESSED && b.status != Status.UNPROCESSED) return -1
        if (a.status != Status.UNPROCESSED && b.status == Status.UNPROCESSED) return 1

        return 0;
    })

    return (
        <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Date of payment</TableHead>
                <TableHead>Status</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {sortedData.map((pay) => (
            <TableRow key={pay.paymentId}>
                <TableCell>{subscriptions.find(sub => sub.subscriptionId === pay.subscriptionId)?.title}</TableCell>
                <TableCell>{subscriptions.find(sub => sub.subscriptionId === pay.subscriptionId)?.price}</TableCell>
                <TableCell>{new Date(pay.dateOfPayment).toLocaleDateString()}</TableCell>
                <TableCell>{pay.status}</TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    )
}
