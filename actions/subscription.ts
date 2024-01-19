import prisma from '@/lib/prisma';
import Stripe from 'stripe'

const DAY_IN_MS = 86_400_000

export const getSubscription = async({userId}:{userId:string|undefined}) => {
  try {
    if (!userId) {
      return {
        subscription: null,
        isSubscribed: false
      }
    }
    const subscription = await prisma.subscription.findUnique({
      where: {userId}
    })
    // console.log('getSubscription subscription', subscription)
    if (!subscription) {
      return {
        subscription: null,
        isSubscribed: false
      }
    }
    const isSubscribed = 
      subscription.status === 'active' &&
      subscription.currentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now()
    return {
      subscription,
      isSubscribed
    }
  } catch(error) {
    console.log('getSubscription error', error)
    return {
      subscription: null,
      isSubscribed: false
    }
  }
}

export const updateSubscription = async({
  subscription
}: {
  subscription: Stripe.Subscription
}) => {
  try {
    const updatedSubscription = await prisma.subscription.update({
      where: {
        customerId: subscription.customer as string
      },
      data: {
        status: subscription.status,
        subscriptionId: subscription.id,
        priceId: subscription.items.data[0].price.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    })
    return updatedSubscription
  } catch(error) {
    console.log('updateSubscription error', error)
  }
}