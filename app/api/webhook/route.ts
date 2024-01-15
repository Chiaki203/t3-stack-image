import {headers} from 'next/headers'
import { NextResponse } from 'next/server'
import {stripe} from '@/lib/stripe'
import { updateSubscription } from '@/actions/subscription'
import Stripe from 'stripe'

export async function POST(req:Request) {
  const body = await req.text()
  // console.log('webhook body', body)
  const signature = headers().get('Stripe-Signature') as string
  console.log('webhook signature', signature)
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch(error:any) {
    return new NextResponse(`Webhook Error: ${error.message}`, {status: 400})
  }
  // console.log('webhook event', event)
  const session1 = event.data.object as Stripe.Checkout.Session
  const session2 = event.data.object as Stripe.Subscription
  // const session = event.data.object 
  // console.log('webhook event session1', session1)
  // console.log('webhook event session2', session2)

  let subscription: Stripe.Subscription

  switch(event.type) {
    case 'checkout.session.completed':
    case 'invoice.payment_succeeded':
      console.log('webhook event type', event.type)
      console.log('webhook event session', session1)
      subscription = await stripe.subscriptions.retrieve(session1.subscription as string)
      console.log('webhook checkout.session.completed subscription', subscription)
      const afterPaymentUpdatedSubscription =  await updateSubscription({subscription})
      console.log('afterPaymentUpdatedSubscription', afterPaymentUpdatedSubscription)
      break
    case 'customer.subscription.updated':
      console.log('webhook event type', event.type)
      console.log('webhook event session', session1)
      subscription = await stripe.subscriptions.retrieve(session1.id as string)
      console.log('webhook customer.subscription.updated subscription', subscription)
      const customerUpdatedSubscription =  await updateSubscription({subscription})
      console.log('customerUpdatedSubscription', customerUpdatedSubscription)
      break
  }
  return new NextResponse('OK', {status: 200})
}