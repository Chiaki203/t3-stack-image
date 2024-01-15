import { publicProcedure, privateProcedure, router } from '../trpc';
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { getSubscription, updateSubscription } from '@/actions/subscription';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { eo } from 'date-fns/locale';

interface CustomInvoice extends Stripe.Invoice {
  payment_intent: Stripe.PaymentIntent
}

interface CustomSubscription extends Stripe.Subscription {
  latest_invoice: CustomInvoice
}

export const subscriptionRouter = router({
  getPrices: privateProcedure.query(async() => {
    try {
      const prices = await stripe.prices.list({
        lookup_keys: ['t3-stack-monthly'],
        expand: ['data.product']
      })
      console.log('subscriptionRouter getPrices prices', prices)
      console.log('subscriptionRouter getPrices prices.data', prices.data)
      console.log('subscriptionRouter getPrices prices data product', prices.data[0].product)
      return prices.data
    } catch(error) {
      console.log('subscriptionRouter getPrices error', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get prices'
      })
    }
  }),
  getClientSecret: privateProcedure.input(
    z.object({
      priceId: z.string()
    })
  ).mutation(async({input, ctx}) => {
    try {
      const {priceId} = input
      const userId = ctx.user.id
      const name = ctx.user.name!
      const email = ctx.user.email!
      const {subscription} = await getSubscription({userId})
      let customerId
      if (subscription) {
        customerId = subscription.customerId
      } else {
        const customer = await stripe.customers.create({
          name, 
          email, 
          metadata: {
            userId
          }
        })
        console.log('subscriptionRouter getClientSecret customer', customer)
        customerId = customer.id
        await prisma.subscription.create({
          data: {
            userId,
            customerId
          }
        })
      }
      let clientSecret
      if (subscription?.status === 'incomplete') {
        console.log('There is an incomplete subscription')
        const subscriptions = await stripe.subscriptions.retrieve(
          subscription.subscriptionId!
        )
        console.log('subscriptionRouter getClientSecret incomplete retrieved subscriptions', subscriptions)
        const invoice = await stripe.invoices.retrieve(
          subscriptions.latest_invoice as string
        )
        console.log('subscriptionRouter getClientSecret incomplete retrieved invoice', invoice)
        const paymentIntent = await stripe.paymentIntents.retrieve(
          invoice.payment_intent as string
        )
        console.log('subscriptionRouter getClientSecret incomplete retrieved paymentIntent', paymentIntent)
        clientSecret = paymentIntent.client_secret
        console.log('subscriptionRouter getClientSecret incomplete clientSecret', clientSecret)
      } else {
        const subscriptions = (await stripe.subscriptions.create({
          customer: customerId,
          items: [
            {price:priceId}
          ],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
          metadata: {
            userId
          }
        })) as CustomSubscription
        console.log('subscriptionRouter getClientSecret create subscriptions', subscriptions)
        await updateSubscription({
          subscription: subscriptions
        })
        clientSecret = subscriptions.latest_invoice.payment_intent.client_secret
        console.log('subscriptionRouter getClientSecret create subscriptions clientSecret', clientSecret)
      }
      if (!clientSecret) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Failed to get client secret'
        })
      }
      return {clientSecret}
    } catch(error) {
      console.log('subscriptionRouter getClientSecret error', error)
      if (error instanceof TRPCError && error.code === 'BAD_REQUEST') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message
        })
      } else {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get client secret'
        })
      }
    }
  }),
  getSubscriptionInfo: privateProcedure.query(async({ctx}) => {
    try {
      const userId = ctx.user.id
      const {subscription} = await getSubscription({userId})
      if (!subscription) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Subscription not found'
        })
      }
      const subscriptions = await stripe.subscriptions.list({
        customer: subscription.customerId,
        status: 'active',
        expand: ['data.default_payment_method']
      })
      console.log('subscriptionRouter getSubscriptionInfo subscriptions', subscriptions)
      return subscriptions
    } catch(error) {
      console.log('subscriptionRouter getSubscriptionInfo error', error)
      if (error instanceof TRPCError && error.code === 'BAD_REQUEST') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message
        })
      } else {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get subscription info'
        })
      }
    }
  }),
  getBillingPortalUrl: privateProcedure.mutation(async({ctx}) => {
    try {
      const userId = ctx.user.id
      const {subscription} = await getSubscription({userId})
      if (!subscription) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Subscription not found'
        })
      }
      const billingPortal = await stripe.billingPortal.sessions.create({
        customer: subscription.customerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`
      })
      console.log('subscriptionRouter getBillingPortalUrl billingPortal', billingPortal)
      
      return {url: billingPortal.url}
    }catch(error) {
      console.log('subscriptionRouter getBillingPortalUrl error', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get billing portal url'
      })
    }
  })
})