import { getAuthSession } from '@/lib/nextauth';
import { initTRPC, TRPCError } from '@trpc/server';

const t = initTRPC.create()

export const authMiddleware = t.middleware(async({next}) => {
  const user = await getAuthSession()
  if (!user) {
    throw new TRPCError({code: 'UNAUTHORIZED'})
  }
  return next({
    ctx: {
      user
    }
  })
})

// t.router({
//   test1: t.procedure.meta({
//     name: 'test1'
//   }).query(() => {
//     return 'test1'
//   }),
// })

export const router = t.router
export const publicProcedure = t.procedure
export const privateProcedure = t.procedure.use(authMiddleware)
