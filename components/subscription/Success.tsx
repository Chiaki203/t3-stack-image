'use client'

import { format } from 'date-fns'
import { ja, enGB } from 'date-fns/locale'
import { CheckCircledIcon } from '@radix-ui/react-icons'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '../ui/table'
import Stripe from 'stripe'

interface SuccessProps {
  subscriptions: Stripe.Subscription[]
}

const Success = ({ subscriptions }: SuccessProps) => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center space-y-5 mb-10">
        <CheckCircledIcon width={50} height={50} className="text-green-500" />
        <div className="font-bold text-xl">Payment Successful</div>
        {subscriptions.map((subscription) => {
          const current_period_start = new Date(
            subscription.current_period_start * 1000
          )
          const current_period_end = new Date(
            subscription.current_period_end * 1000
          )
          return (
            <div key={subscription.id} className="mb-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">
                      Payment Number
                    </TableHead>
                    <TableHead className="text-center">Start Date</TableHead>
                    <TableHead className="text-center">End Date</TableHead>
                    <TableHead className="text-center">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-center">
                      {subscription.id}
                    </TableCell>
                    <TableCell className="text-center">
                      {format(current_period_start, 'dd MMM yyyy HH:MM', {
                        locale: enGB,
                      })}
                    </TableCell>
                    <TableCell className="text-center">
                      {format(current_period_end, 'dd MMM yyyy HH:MM', {
                        locale: enGB,
                      })}
                    </TableCell>
                    <TableCell className="text-center">
                      {subscription.items.data[0].price.unit_amount} €
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Success
