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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AlertDialogFooter, AlertDialogHeader } from "../ui/alert-dialog";
import { useState } from "react";
import { getAuthTokenFromCookie } from "@/utils/auth-functions";
import { useDashboardContext } from "../dashboard-context";

export function PaymentsTable({ payments, subscriptions }: { payments: Payment[] | null, subscriptions: Subscription[] | null}) {
    const [open, setOpen] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
    const { refreshData } = useDashboardContext()

    if (payments === null || subscriptions === null) {
        return "detseta";
    } 

    const sortedData = [...payments].sort((a, b) => {
        if (a.dateOfPayment < b.dateOfPayment) return 1
        if (a.dateOfPayment >= b.dateOfPayment) return -1

        return 0;
    })

    const isUnprocessed = (status: Payment['status']) => String(status) === "UNPROCESSED";

    const confirmProcess = async () => {
        if (!selectedPaymentId) return;
        const URL = 'http://localhost:8080/api/';
        const token = getAuthTokenFromCookie()
        
        try {
            const res = await fetch(`${URL}payment/${selectedPaymentId}/process`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                 },
            });

            if (!res.ok) throw new Error('Network response was not ok');
            
            refreshData()

        } catch (error) {
            console.error('Failed to process payment:', error);
            alert('Failed to update payment status. Please try again.');
        } finally {
            setOpen(false);
            setSelectedPaymentId(null);
        }
    };

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
            {sortedData.map((pay) => {
                const statusIsUnprocessed = isUnprocessed(pay.status);

                return ( 
                    <TableRow key={pay.paymentId}>
                        <TableCell>{pay.subscriptionTitle}</TableCell>
                        <TableCell>{pay.amount.toFixed(2)} zł</TableCell>
                        <TableCell>{new Date(pay.dateOfPayment).toLocaleDateString()}</TableCell>
                        <TableCell>
                            {statusIsUnprocessed ? (
                                <AlertDialog open={open} onOpenChange={setOpen}>
                                <AlertDialogTrigger
                                    asChild
                                    onClick={() => setSelectedPaymentId(pay.paymentId)}
                                    >
                                    <button className="px-2 py-1 rounded bg-[var(--primary)] text-white hover:bg-[var(--secondary)]">
                                    Process
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Processing</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to mark this payment as PAID? (This action cannot be undo)
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-red-500 text-white hover:bg-red-700:">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={confirmProcess} className="bg-blue-500 text-white hover:bg-blue-700:" >
                                        Confirm
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                                </AlertDialog>
                            ) : (
                                <span>{pay.status}</span>
                            )}
                        </TableCell>
                    </TableRow>
                )
            })}
        </TableBody>
        </Table>
    )
}
