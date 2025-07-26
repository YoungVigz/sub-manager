"use client";

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAuthTokenFromCookie } from "@/utils/auth-functions"

const formSchema = z.object({
  title:             z.string().min(1, "Nazwa jest wymagana"),
  description:       z.string().optional(),
  price:             z.number().positive("Cena musi być większa niż 0"),
  cycle:             z.enum(["MONTHLY", "YEARLY"]),
  dateOfLastPayment: z.date().refine(d => d instanceof Date, "Data jest wymagana"),
  currencyId:        z.literal(1),
})

type FormValues = z.infer<typeof formSchema>

export default function AddSubscriptionForm() {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title:             "",
      description:       "",
      price:             0,
      cycle:             "MONTHLY",
      dateOfLastPayment: new Date(),
      currencyId:        1,
    },
  })

  const selectedDate = watch("dateOfLastPayment")

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const token = getAuthTokenFromCookie()
      const res = await fetch("http://localhost:8080/api/subscription", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          Authorization:   `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          dateOfLastPayment: format(data.dateOfLastPayment, "yyyy-MM-dd"),
        }),
      })
      if (!res.ok) throw new Error("Błąd serwera")
      reset()  // resetujemy wszystkie pola do defaultValues
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      {/* Nazwa */}
      <div>
        <Label htmlFor="title">Nazwa</Label>
        <Input id="title" {...register("title")} />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Opis */}
      <div>
        <Label htmlFor="description">Opis</Label>
        <Textarea id="description" {...register("description")} />
      </div>

      {/* Cena */}
      <div>
        <Label htmlFor="price">Cena</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          {...register("price", { valueAsNumber: true })}
        />
        {errors.price && (
          <p className="text-sm text-red-500">{errors.price.message}</p>
        )}
      </div>

      {/* Cykl */}
      <div>
        <Label htmlFor="cycle">Cykl</Label>
        <Select
          defaultValue="MONTHLY"
          onValueChange={(val: "MONTHLY" | "YEARLY") =>
            setValue("cycle", val, { shouldValidate: true })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Wybierz cykl" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MONTHLY">Miesięczny</SelectItem>
            <SelectItem value="YEARLY">Roczny</SelectItem>
          </SelectContent>
        </Select>
        {errors.cycle && (
          <p className="text-sm text-red-500">{errors.cycle.message}</p>
        )}
      </div>

      {/* Data ostatniej płatności */}
      <div className="flex flex-col gap-1">
        <Label>Data ostatniej płatności</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate
                ? format(selectedDate, "yyyy-MM-dd")
                : "Wybierz datę"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setValue("dateOfLastPayment", date, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              }}
              required
            />
          </PopoverContent>
        </Popover>
        {errors.dateOfLastPayment && (
          <p className="text-sm text-red-500">
            {errors.dateOfLastPayment.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" disabled={loading}>
        {loading ? "Wysyłanie..." : "Dodaj subskrypcję"}
      </Button>
    </form>
  )
}
