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

const schema = z
  .object({
    currentPassword: z
      .string()
      .min(8, { message: 'Password has to be at least 8 characters long' }),
    newPassword: z
      .string()
      .min(8, { message: 'Password has to be at least 8 characters long' }),
    confirmPassword: z
      .string()
      .min(8, { message: 'Password has to be at least 8 characters long' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'new password and confirm password do not match',
    path: ['confirmPassword'],
  })

type InputType = z.infer<typeof schema>

const Password = () => {
  const router = useRouter()
  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })
  const { mutate: changePassword, isLoading } =
    trpc.auth.changePassword.useMutation({
      onSuccess: () => {
        form.reset()
        toast.success('Password Changed')
        router.refresh()
      },
      onError: (error: any) => {
        toast.error(error.message)
        console.log('changePassword error', error)
      },
    })
  const onSubmit: SubmitHandler<InputType> = (data) => {
    changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
  }
  return (
    <div>
      <div className="text-xl font-bold text-center mb-5">Change Password</div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
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
            Change Password
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default Password
