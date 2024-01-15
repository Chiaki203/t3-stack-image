'use client'

import { useState } from 'react'
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
import { FcGoogle } from 'react-icons/fc'
import { LuLoader2 } from 'react-icons/lu'
import { signIn } from 'next-auth/react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const schema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password has to be at least 8 characters long' }),
})

type InputType = z.infer<typeof schema>

const Login = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  })
  const handleGoogleLogin = async () => {
    try {
      const result = await signIn('google', { callbackUrl: '/' })
      if (result?.error) {
        toast.error('Google Login Failed')
      }
    } catch (error) {
      toast.error('Google Login Failed')
    }
  }
  const onSubmit: SubmitHandler<InputType> = async (data) => {
    setIsLoading(true)
    try {
      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      if (res?.error) {
        toast.error('Login Failed')
        return
      }
      toast.success('Login Successful')
      router.push('/')
      router.refresh()
    } catch (error) {
      toast.error('Login Failed')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="max-w-[400px] m-auto">
      <div className="text-2xl font-bold text-center mb-10">Login</div>
      <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
        <FcGoogle className="mr-2 h-4 w-4" />
        Login with Google
      </Button>
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-2 text-muted-foreground">OR</span>
        </div>
      </div>
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
          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading && <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
        </form>
      </Form>
      <div className="text-center mt-5">
        <Link href="/reset-password" className="text-sm text-blue-500">
          Forgot Password?
        </Link>
      </div>
      <div className="text-center mt-2">
        <Link href="/signup" className="text-sm text-blue-500">
          Don&apos;t have an account? Sign Up
        </Link>
      </div>
    </div>
  )
}

export default Login
