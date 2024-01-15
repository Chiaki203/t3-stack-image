'use client'

import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormLabel,
  FormField,
  FormItem,
  FormMessage,
} from '../ui/form'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { trpc } from '@/trpc/react'
import { LuLoader2 } from 'react-icons/lu'
import toast from 'react-hot-toast'

const schema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password and Confirm Password do not match',
    path: ['confirmPassword'],
  })

type InputType = z.infer<typeof schema>

interface ResetPasswordProps {
  token: string
}

const ResetPassword = ({ token }: ResetPasswordProps) => {
  const router = useRouter()
  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })
  const { mutate: resetPassword, isLoading } =
    trpc.auth.resetPassword.useMutation({
      onSuccess: () => {
        toast.success('Password reset successfully')
        router.push('/login')
        router.refresh()
      },
      onError: (error: any) => {
        toast.error(error.message)
        console.log('resetPassword error', error)
      },
    })
  const onSubmit: SubmitHandler<InputType> = (data) => {
    resetPassword({
      token,
      password: data.password,
    })
  }
  return (
    <div className="max-w-[400px] m-auto">
      <div className="text-2xl font-bold text-center mb-10">Reset Password</div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
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

export default ResetPassword
