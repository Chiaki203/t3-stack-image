'use client'

import { useState } from 'react'
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
  FormDescription,
} from '../ui/form'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Checkbox } from '../ui/checkbox'
import { Post } from '@prisma/client'
import { trpc } from '@/trpc/react'
import { LuLoader2 } from 'react-icons/lu'
import ImageUploading, { ImageListType } from 'react-images-uploading'
import Image from 'next/image'
import toast from 'react-hot-toast'

const schema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  content: z
    .string()
    .min(3, { message: 'Content must be at least 3 characters' }),
  premium: z.boolean(),
})

type InputType = z.infer<typeof schema>

interface PostEditProps {
  post: Post
}

const PostEdit = ({ post }: PostEditProps) => {
  const router = useRouter()
  const [imageUpload, setImageUpload] = useState<ImageListType>([
    {
      dataURL: post.image || '/noImage.png',
    },
  ])
  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post.title || '',
      content: post.content || '',
      premium: post.premium || false,
    },
  })
  const { mutate: updatePost, isLoading } = trpc.post.updatePost.useMutation({
    onSuccess: () => {
      toast.success('Post updated')
      router.push(`/post/${post.id}`)
      router.refresh()
    },
    onError: (error: any) => {
      toast.error(error.message)
      console.log('updatePost error', error)
    },
  })
  const onSubmit: SubmitHandler<InputType> = async (data) => {
    let base64Image
    if (
      imageUpload[0].dataURL &&
      imageUpload[0].dataURL.startsWith('data:image')
    ) {
      base64Image = imageUpload[0].dataURL
    }
    updatePost({
      postId: post.id,
      title: data.title,
      content: data.content,
      base64Image,
      premium: data.premium,
    })
  }
  const onChangeImage = (imageList: ImageListType) => {
    console.log('postEdit imageList', imageList)
    const file = imageList[0]?.file
    const maxFileSize = 5 * 1024 * 1024
    if (file && file.size > maxFileSize) {
      toast.error('Image size must be less than 5MB')
      return
    }
    setImageUpload(imageList)
  }
  return (
    <div>
      <div className="text-2xl font-bold text-center mb-5">Edit Post</div>
      <Form {...form}>
        <div className="mb-5">
          <FormLabel>Post Image</FormLabel>
          <div className="mt-2">
            <ImageUploading
              value={imageUpload}
              onChange={onChangeImage}
              maxNumber={1}
              acceptType={['jpg', 'png', 'jpeg']}
            >
              {({ imageList, onImageUpdate }) => (
                <div className="w-full">
                  {imageList.map((image, index) => (
                    <div key={index}>
                      {image.dataURL && (
                        <div className="aspect-[16/9] relative">
                          <Image
                            src={image.dataURL}
                            alt="post image"
                            className="object-cover rounded-lg"
                            fill
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {imageList.length > 0 && (
                    <div className="text-center mt-3">
                      <Button
                        variant="outline"
                        onClick={() => onImageUpdate(0)}
                      >
                        Change Image
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </ImageUploading>
          </div>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Content of the post"
                    {...field}
                    rows={15}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="premium"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-5 shadow-sm">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-2 leading-none">
                  <FormLabel>Premium Content</FormLabel>
                  <FormDescription>
                    This post is for premium members only
                  </FormDescription>
                </div>
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

export default PostEdit
