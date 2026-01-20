"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil } from "lucide-react"
import { Subscription } from "@/types"
import { getAuthTokenFromCookie } from "@/utils/auth-functions"
import { useDashboardContext } from "../dashboard-context"

const editSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  price: z.number().positive(),
})

type EditValues = z.infer<typeof editSchema>

export function EditSubscriptionDialog({ subscription }: { subscription: Subscription }) {
  const [open, setOpen] = useState(false)
  const { refreshData } = useDashboardContext()
  const { register, handleSubmit, formState: { errors } } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: subscription.title,
      description: subscription.description,
      price: subscription.price,
    }
  })

  const onSubmit = async (data: EditValues) => {
    try {
      const token = getAuthTokenFromCookie()
      const res = await fetch(`http://localhost:8080/api/subscription/${subscription.subscriptionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      
      if (res.ok) {
        setOpen(false)
        refreshData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mr-2">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input {...register("title")} />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>
          <div>
            <Label>Description</Label>
            <Textarea {...register("description")} />
          </div>
          <div>
            <Label>Price</Label>
            <Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
          </div>
          <Button type="submit" className="w-full bg-[var(--primary)] text-white">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}