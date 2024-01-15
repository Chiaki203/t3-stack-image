'use client'

import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { LuLoader2 } from 'react-icons/lu'
import { trpc } from '@/trpc/react'
import Stripe from 'stripe'
import toast from 'react-hot-toast'

interface PaymentProps {
  prices: Stripe.Price[]
}

const Payment = ({ prices }: PaymentProps) => {
  const router = useRouter()
  const { mutate: getClientSecret, isLoading } =
    trpc.subscription.getClientSecret.useMutation({
      onSuccess: ({ clientSecret }) => {
        router.push(`/payment/${clientSecret}`)
      },
      onError: (error: any) => {
        toast.error('Error creating payment intent')
        console.log('getClientSecret error', error)
      },
    })
  const handlePayment = (priceId: string) => {
    getClientSecret({ priceId })
  }
  return (
    <div>
      <div className="text-2xl font-bold text-center mb-10">
        Subscribe to Premium
      </div>
      <div className="max-w-[500px] m-auto">
        {prices.map((price) => (
          <div
            key={price.id}
            className="border rounded-md px-5 py-10 space-y-5"
          >
            <div>{(price.product as Stripe.Product).name}</div>
            <div className="flex items-end justify-center space-x-1">
              <div className="font-bold text-3xl">
                {price.unit_amount!.toLocaleString()}
              </div>{' '}
              <div>€ / Month</div>
            </div>
            <Button
              className="w-full"
              variant="premium"
              onClick={() => handlePayment(price.id)}
              disabled={isLoading}
            >
              {isLoading && <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              Subscribe
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Payment
