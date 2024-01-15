'use client'

import { Button } from '../ui/button'
import { Subscription } from '@prisma/client'
import { LuLoader2 } from 'react-icons/lu'
import { trpc } from '@/trpc/react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface BillingProps {
  subscription: Subscription | null
  isSubscribed: boolean
}

const Billing = ({ subscription, isSubscribed }: BillingProps) => {
  const { mutate: getBillingPortalUrl, isLoading } =
    trpc.subscription.getBillingPortalUrl.useMutation({
      onSuccess: ({ url }) => {
        window.location.href = url
      },
      onError: (error: any) => {
        toast.error('Failed to get billing portal url')
        console.log('Failed to get billing portal url', error)
      },
    })
  const handleBillingPortal = () => {
    getBillingPortalUrl()
  }
  return (
    <div className="space-y-5">
      <div className="text-xl font-bold text-center">Current Plan</div>
      <div>
        Your current plan is{' '}
        <strong>{isSubscribed ? 'Premium' : 'Free'}</strong>
      </div>
      {isSubscribed && subscription && (
        <div>
          {subscription?.cancelAtPeriodEnd
            ? `Your subscription will end on ${format(
                new Date(subscription.currentPeriodEnd!),
                'dd MMM yyyy HH:mm'
              )}`
            : `Your subscription will renew on ${format(
                new Date(subscription.currentPeriodEnd!),
                'dd MMM yyyy HH:mm'
              )}`}
        </div>
      )}
      <Button
        className="w-full"
        onClick={handleBillingPortal}
        disabled={isLoading || !isSubscribed}
      >
        {isLoading && <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />}
        Manage Subscription
      </Button>
    </div>
  )
}

export default Billing
