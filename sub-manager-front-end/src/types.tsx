export interface Subscription {
  subscriptionId: number
  title: string
  description: string
  price: number
  cycle: string
  dateOfLastPayment: string
  currencyId: number
}

export enum Status {
  PAID,
  UNPROCESSED
}

export interface Payment {
  paymentId: number,
  status: Status,
  dateOfPayment: string,
  subscriptionId: number
}