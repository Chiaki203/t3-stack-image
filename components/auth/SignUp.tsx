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
import { FcGoogle } from 'react-icons/fc'
import { trpc } from '@/trpc/react'
import { LuLoader2 } from 'react-icons/lu'
import { signIn } from 'next-auth/react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const schema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name has to be at least 2 characters long' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password has to be at least 8 characters long' }),
})

type InputType = z.infer<typeof schema>

const SignUp = () => {
  const router = useRouter()
  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })
  const handleGoogleSignUp = async () => {
    try {
      const result = await signIn('google', { callbackUrl: '/' })
      if (result?.error) {
        toast.error('Google Sign Up Failed')
      }
    } catch (error) {
      toast.error('Google Sign Up Failed')
    }
  }
  const { mutate: signUp, isLoading } = trpc.auth.signUp.useMutation({
    onSuccess: () => {
      toast.success('Sign Up Successful')
      signIn('credentials', {
        email: form.getValues('email'),
        password: form.getValues('password'),
        callbackUrl: '/',
      })
      router.refresh()
    },
    onError: (error: any) => {
      toast.error('Sign Up Failed')
      console.log(error)
    },
  })
  const onSubmit: SubmitHandler<InputType> = (data) => {
    signUp(data)
  }
  return (
    <div className="max-w-[400px] m-auto">
      <div className="text-2xl font-bold text-center mb-10">Sign Up</div>
      <Button variant="outline" className="w-full" onClick={handleGoogleSignUp}>
        <FcGoogle className="mr-2 w-4 h-4" />
        Sign Up with Google
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="current-password"
                    placeholder="***"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="text-sm text-gray-500">
            By signing up, you agree to our{' '}
            <Link href="/terms-of-service">Terms of Service</Link> and{' '}
            <Link href="/privacy-policy">Privacy Policy</Link>
          </div>
          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading && <LuLoader2 className="mr-2 w-4 h-4 animate-spin" />}
            Sign Up
          </Button>
        </form>
      </Form>
      <div className="text-center mt-5">
        <Link href="/login" className="text-sm text-blue-500">
          Already have an account?
        </Link>
      </div>
    </div>
  )
}

export default SignUp
