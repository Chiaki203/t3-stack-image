import {httpBatchLink, createTRPCProxyClient} from '@trpc/client'
import {appRouter, type AppRouter} from '@/trpc/server'
import {createTRPCNext} from '@trpc/next'

export const trpc = appRouter.createCaller({
// export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/trpc`
    })
  ]
})