'use client'

import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { trpc } from '@/trpc/react'
import { LuLoader2 } from 'react-icons/lu'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
})

type InputType = z.infer<typeof schema>

const ForgotPassword = () => {
  const router = useRouter()
  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
  })
  const { mutate: forgotPassword, isLoading } =
    trpc.auth.forgotPassword.useMutation({
      onSuccess: () => {
        toast.success('Email sent for resetting password')
        form.reset()
        router.refresh()
      },
      onError: (error: any) => {
        toast.error(error.message)
        console.log('forgotPassword error', error)
      },
    })
  const onSubmit: SubmitHandler<InputType> = (data) => {
    forgotPassword(data)
  }
  return (
    <div className="max-w-[400px] m-auto">
      <div className="text-2xl font-bold text-center mb-10">Reset Password</div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading && <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default ForgotPassword
