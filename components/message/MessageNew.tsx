'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { trpc } from '@/trpc/react'
import { LuLoader2, LuArrowUp, LuPaperclip } from 'react-icons/lu'
import toast from 'react-hot-toast'
import ImageUploading, { ImageListType } from 'react-images-uploading'
import Image from 'next/image'

const schema = z.object({
  prompt: z.string().min(3, 'Prompt has to be at least 3 characters long'),
})

type InputType = z.infer<typeof schema>

interface MessageNewProps {
  chatId: string
}

const MessageNew = ({ chatId }: MessageNewProps) => {
  const router = useRouter()
  const [imageUpload, setImageUpload] = useState<ImageListType>([])
  // const subscriptionModal = useSubscriptionModal()
  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      prompt: '',
    },
  })
  const { mutate: createUserMessage, isLoading: isUserLoading } =
    trpc.chat.createUserMessage.useMutation({
      onSuccess: () => {
        let base64Image
        if (imageUpload.length) {
          base64Image = imageUpload[0].dataURL
        }
        createChatGPTMessage({
          prompt: form.getValues('prompt'),
          base64Image,
          chatId,
        })
        toast.success('Message created')
        form.reset()
        setImageUpload([])
        router.refresh()
      },
      onError: (error: any) => {
        if (error.message === 'FORBIDDEN') {
          // subscriptionModal.open()
          form.reset()
        } else {
          toast.error(error.message)
          console.log('MessageNew createUserMessage error', error)
        }
      },
    })
  const { mutate: createChatGPTMessage, isLoading: isChatGPTLoading } =
    trpc.chat.createChatGPTMessage.useMutation({
      onSuccess: () => {
        toast.success('Image generated')
        router.refresh()
      },
      onError: (error: any) => {
        toast.error(error.message)
        console.log('MessageNew createChatGPTMessage error', error)
        router.refresh()
      },
    })
  const onSubmit: SubmitHandler<InputType> = async (data) => {
    let base64Image
    if (imageUpload.length) {
      base64Image = imageUpload[0].dataURL
    }
    createUserMessage({
      chatId,
      prompt: data.prompt,
      base64Image,
    })
  }
  const onChangeImage = (imageList: ImageListType) => {
    const file = imageList[0]?.file
    const maxFileSize = 5 * 1024 * 1024
    if (file && file.size > maxFileSize) {
      toast.error('Image size has to be less than 5MB')
      return
    }
    setImageUpload(imageList)
  }
  return (
    <div className="max-w-[1000px] mx-auto">
      <Form {...form}>
        <div className="flex items-end justify-center space-x-2 border rounded-md p-2">
          <ImageUploading
            value={imageUpload}
            onChange={onChangeImage}
            maxNumber={1}
            acceptType={['jpg', 'jpeg', 'png']}
          >
            {({ imageList, onImageUpdate }) => (
              <div>
                {imageList.map((image, index) => (
                  <div key={index}>
                    {image.dataURL && (
                      <div className="aspect-[1/1] relative mb-1">
                        <Image
                          fill
                          src={image.dataURL}
                          alt="image"
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                ))}
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => onImageUpdate(0)}
                    disabled={isUserLoading || isChatGPTLoading}
                  >
                    <LuPaperclip className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </ImageUploading>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-center flex-1 space-x-2"
          >
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Type a prompt"
                      disabled={isUserLoading || isChatGPTLoading}
                      className="min-h-[36px] border-none shadow-none focus-visible:ring-0 bg-gray-50"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          form.handleSubmit(onSubmit)()
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={isUserLoading || isChatGPTLoading}
              type="submit"
              variant="outline"
            >
              {isUserLoading || isChatGPTLoading ? (
                <LuLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LuArrowUp className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </Form>
    </div>
  )
}

export default MessageNew
