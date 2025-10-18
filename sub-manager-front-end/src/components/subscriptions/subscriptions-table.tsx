import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Subscription } from "@/types"
import { Button } from "../ui/button"
import { useState } from "react"
import { Trash2 } from "lucide-react"
import { getAuthTokenFromCookie } from "@/utils/auth-functions"

export function SubscriptionsTable({ data, onDelete }: { data: Subscription[], onDelete?: (id: number) => void } ) {

  const [loadingId, setLoadingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć tę subskrypcję?")) return

    try {
      setLoadingId(id)
      const token = getAuthTokenFromCookie()
      const res = await fetch(`http://localhost:8080/api/subscription/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error("Nie udało się usunąć subskrypcji.")

      // jeśli przekazano callback odświeżenia listy
      if (onDelete) onDelete(id)
      else window.location.reload()
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setLoadingId(null)
    }
  }



  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Cycle</TableHead>
          <TableHead>Last Payment</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((sub) => (
          <TableRow key={sub.subscriptionId}>
            <TableCell>{sub.title}</TableCell>
            <TableCell>{sub.description}</TableCell>
            <TableCell>{sub.price} zł</TableCell>
            <TableCell>{sub.cycle}</TableCell>
            <TableCell>{new Date(sub.dateOfLastPayment).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(sub.subscriptionId)}
                disabled={loadingId === sub.subscriptionId}
              >
                {loadingId === sub.subscriptionId ? "Usuwanie..." : <Trash2 className="w-4 h-4" />}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
