import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Subscription } from "@/types"

export function SubscriptionsTable({ data }: { data: Subscription[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Cycle</TableHead>
          <TableHead>Last Payment</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((sub) => (
          <TableRow key={sub.subscriptionId}>
            <TableCell>{sub.title}</TableCell>
            <TableCell>{sub.description}</TableCell>
            <TableCell>{sub.price}</TableCell>
            <TableCell>{sub.cycle}</TableCell>
            <TableCell>{new Date(sub.dateOfLastPayment).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
