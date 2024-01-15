'use client'

import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { useState } from 'react'
import { Button } from '../ui/button'
import { LuLoader2 } from 'react-icons/lu'
import { useRouter } from 'next/navigation'

interface PaymentFormProps {
  name: string
  email: string
}

const PaymentForm = ({ name, email }: PaymentFormProps) => {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  console.log('PaymentForm stripe elements', elements)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!stripe || !elements) {
      return
    }
    setIsLoading(true)
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      },
    })
    router.refresh()
    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(
        error.message || 'Something went wrong. Please try again later.'
      )
    } else {
      setMessage('Something went wrong. Please try again later.')
    }
    setIsLoading(false)
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <PaymentElement
        options={{
          defaultValues: {
            billingDetails: {
              name,
              email,
            },
          },
          layout: 'tabs',
        }}
      />
      <Button disabled={isLoading || !stripe || !elements} className="w-full">
        {isLoading ||
          !stripe ||
          (!elements && <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />)}
        Pay
      </Button>
      {message && <div className="text-center text-red-500">{message}</div>}
    </form>
  )
}

export default PaymentForm
