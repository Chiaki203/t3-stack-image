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
import { Textarea } from '../ui/textarea'
import { User } from '@prisma/client'
import { trpc } from '@/trpc/react'
import { LuLoader2 } from 'react-icons/lu'
import ImageUploading, { ImageListType } from 'react-images-uploading'
import Image from 'next/image'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z
    .string()
    .min(3, { message: 'Name has to be at least 3 characters long' }),
  introduction: z.string().optional(),
})

type InputType = z.infer<typeof schema>

interface ProfileProps {
  user: User
}

const Profile = ({ user }: ProfileProps) => {
  const router = useRouter()
  const [imageUpload, setImageUpload] = useState<ImageListType>([
    {
      dataURL: user.image || '/default.png',
    },
  ])
  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name || '',
      introduction: user.introduction || '',
    },
  })
  const { mutate: updateUser, isLoading } = trpc.user.updateUser.useMutation({
    onSuccess: () => {
      toast.success('Profile Updated')
      router.refresh()
    },
    onError: (error: any) => {
      toast.error(error.message)
      console.log(error)
    },
  })
  const onSubmit: SubmitHandler<InputType> = (data) => {
    let base64Image
    if (
      imageUpload[0].dataURL &&
      imageUpload[0].dataURL.startsWith('data:image')
    ) {
      base64Image = imageUpload[0].dataURL
    }
    updateUser({
      name: data.name,
      introduction: data.introduction,
      base64Image,
    })
  }
  const onChangeImage = (imageList: ImageListType) => {
    console.log('onChangeImage imageList', imageList)
    const file = imageList[0]?.file
    console.log('onChangeImage file', file)
    const maxFileSize = 5 * 1024 * 1024
    if (file && file.size > maxFileSize) {
      toast.error('File size must be less than 5MB')
      return
    }
    setImageUpload(imageList)
  }
  return (
    <div>
      <div className="text-xl font-bold text-center mb-5">Profile</div>
      <Form {...form}>
        <div className="mb-5">
          <ImageUploading
            value={imageUpload}
            onChange={onChangeImage}
            maxNumber={1}
            acceptType={['jpg', 'png', 'jpeg']}
          >
            {({ imageList, onImageUpdate }) => (
              <div className="w-full flex flex-col items-center justify-center">
                {imageList.map((image, index) => (
                  <div key={index}>
                    {image.dataURL && (
                      <div className="relative w-24 h-24">
                        <Image
                          src={image.dataURL}
                          alt={user.name || 'avatar'}
                          className="rounded-full object-cover"
                          fill
                        />
                      </div>
                    )}
                  </div>
                ))}
                {imageList.length > 0 && (
                  <div className="text-center mt-3">
                    <Button variant="outline" onClick={() => onImageUpdate(0)}>
                      Change Image
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ImageUploading>
        </div>
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
          <FormItem>
            <FormLabel>Email</FormLabel>
            <Input value={user.email!} disabled />
          </FormItem>
          <FormField
            control={form.control}
            name="introduction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Introduction</FormLabel>
                <FormControl>
                  <Textarea placeholder="Introduction" {...field} rows={10} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading && <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default Profile
