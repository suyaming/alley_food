export interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  image: string
  category: string
}

export interface CartItem {
  id: string
  quantity: number
}

export interface CartLine extends CartItem {
  product: Product
  lineTotal: number
}

export type OrderStatus =
  | 'PENDING'           // PayPal order created, awaiting buyer approval
  | 'CAPTURED'          // payment captured, awaiting kitchen action
  | 'PREPARING'         // kitchen accepted and is cooking
  | 'READY'             // packed, awaiting courier
  | 'OUT_FOR_DELIVERY'  // courier picked up
  | 'DELIVERED'         // delivered to buyer
  | 'REFUNDED'          // payment refunded
  | 'DISPUTED'          // PayPal dispute opened
  | 'CANCELLED'         // cancelled by buyer or kitchen before capture
  | 'FAILED'            // payment capture failed

export interface OrderRecord {
  id: string
  status: OrderStatus
  createdAt: string
  updatedAt: string
  items: Array<{
    id: string
    name: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }>
  currency: string
  amount: number
  payerEmail?: string
  payerName?: string
  captureId?: string
  emailSentAt?: string
}
