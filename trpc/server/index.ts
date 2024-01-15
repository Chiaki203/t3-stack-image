import { router } from './trpc';
import { authRouter } from './routers/auth';
import { userRouter } from './routers/user';
import { postRouter } from './routers/post';
import { commentRouter } from './routers/comment';
import { subscriptionRouter } from './routers/subscription';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  post: postRouter,
  comment: commentRouter,
  subscription: subscriptionRouter
})

export type AppRouter = typeof appRouter