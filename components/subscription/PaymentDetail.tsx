'use client'

import { StripeElementsOptions, loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import PaymentForm from './PaymentForm'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

interface PaymentDetailProps {
  clientSecret: string
  name: string
  email: string
}

const PaymentDetail = ({ clientSecret, name, email }: PaymentDetailProps) => {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        borderRadius: '8px',
      },
    },
  }
  return (
    <div className="max-w-[400px] mx-auto">
      <div className="text-center font-bold mb-5 text-xl">
        Enter your card details
      </div>
      <Elements options={options} stripe={stripePromise}>
        <PaymentForm name={name} email={email} />
      </Elements>
    </div>
  )
}

export default PaymentDetail
