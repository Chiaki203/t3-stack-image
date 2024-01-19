import { privateProcedure, router } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createCloudImage, deleteCloudImage } from '@/actions/cloudImage'; 
import { extractPublicId } from 'cloudinary-build-url';
import { getSubscription } from '@/actions/subscription';
import prisma from '@/lib/prisma';
import OpenAI from 'openai';
import { MAX_COUNT } from '@/lib/utils';

const openai = new OpenAI()

export const chatRouter = router({
  createChat: privateProcedure.input(
    z.object({
      name: z.string()
    })
  ).mutation(async({input, ctx}) => {
    try {
      const {name} = input
      const userId = ctx.user.id
      const chat = await prisma.chat.create({
        data: {
          userId,
          name
        }
      })
    } catch(error) {
      console.log('chatRouter createChat error', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create chat'
      })
    }
  }),
  deleteChat: privateProcedure.input(
    z.object({
      chatId: z.string()
    })
  ).mutation(async({input, ctx}) => {
    try {
      const {chatId} = input
      const userId = ctx.user.id
      const chat = await prisma.chat.findUnique({
        where: {id: chatId},
        include: {
          messages: {
            where: {
              image: {
                not: null
              }
            }
          },
          user: {
            select: {
              id: true
            }
          }
        }
      })
      if (!chat) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Chat not found'
        })
      }
      if (userId !== chat.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You are not the owner of this chat'
        })
      }
      for (const message of chat.messages) {
        const publicId = extractPublicId(message.image!)
        await deleteCloudImage(publicId)
      }
      await prisma.chat.delete({
        where: {id: chatId}
      })
    } catch(error) {
      console.log('chatRouter deleteChat error', error)
      if (error instanceof TRPCError && error.code === 'BAD_REQUEST') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message
        })
      } else {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete chat'
        })
      }
    }
  }),
  editChat: privateProcedure.input(
    z.object({
      chatId: z.string(),
      name: z.string()
    })
  ).mutation(async({input, ctx}) => {
    try {
      const {chatId, name} = input
      const userId = ctx.user.id
      const chat = await prisma.chat.findUnique({
        where: {id:chatId},
        include: {
          user: {
            select: {
              id: true
            }
          }
        }
      })
      if (!chat) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Chat not found'
        })
      } 
      if (userId !== chat.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You are not the owner of this chat'
        })
      }
      await prisma.chat.update({
        where: {id: chatId},
        data: {
          name
        }
      })
      return 
    } catch(error) {
      console.log('chatRouter editChat error', error)
      if (error instanceof TRPCError && error.code === 'BAD_REQUEST') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message
        })
      } else {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to edit chat'
        })
      }
    }
  }),
  createUserMessage: privateProcedure.input(
    z.object({
      chatId: z.string(),
      prompt: z.string(),
      base64Image: z.string().optional()
    })
  ).mutation(async({input, ctx}) => {
    try {
      const {chatId, prompt, base64Image} = input
      const userId = ctx.user.id
      const count = ctx.user.count
      const {isSubscribed} = await getSubscription({userId})
      if (count >= MAX_COUNT && !isSubscribed) {
        throw new TRPCError({
          code: 'FORBIDDEN',
        })
      }
      let url 
      if (base64Image) {
        url = await createCloudImage(base64Image)
      }
      await prisma.message.create({
        data: {
          userId,
          chatId,
          role: 'user',
          prompt,
          ...(url && {image: url})
        }
      })
      await prisma.user.update({
        where: {id: userId},
        data: {count: count + 1}
      })
      return 
    } catch(error) {
      console.log('chatRouter createUserMessage error', error)
      if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
        console.log('FORBIDDEN')
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You have reached limit of free messages.'
        })
      } else {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user message'
        })
      }
    }
  }),
  createChatGPTMessage:privateProcedure.input(
    z.object({
      chatId: z.string(),
      prompt: z.string(),
      base64Image: z.string().optional()
    })
  ).mutation(async({input, ctx}) => {
    const {chatId, prompt, base64Image} = input
    const userId = ctx.user.id
    try {
      let descriptionText
      if (base64Image) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: base64Image
                  }
                },
                {
                  type: 'text',
                  text: 'Describe the image in detail (colors, features, theme, style, etc)'
                }
              ]
            }
          ],
          max_tokens: 500
        })
        console.log('image describe response', response)
        console.log('image describe response.choices[0].message', response.choices[0].message)
        descriptionText = response.choices[0].message.content
      }
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: descriptionText ? prompt + '\n\n' + descriptionText : prompt,
        size: '1792x1024',
        quality: 'standard',
        n: 1
      })
      console.log('dalle3 generated image response', response)
      const url = response.data[0].url
      const revised_prompt = response.data[0].revised_prompt
      if (url && revised_prompt) {
        const cloudImageUrl = await createCloudImage(url)
        await prisma.message.create({
          data: {
            userId,
            chatId,
            role: 'assistant',
            prompt: revised_prompt,
            image: cloudImageUrl
          }
        })
      }
      return
    } catch(error:any) {
      console.log('chatRouter createChatGPTMessage error', error)
      if (error.code === 'content_policy_violation') {
        await prisma.message.create({
          data: {
            userId,
            chatId,
            role: 'assistant',
            prompt: error.error.message
          }
        })
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate image'
      })
    }
  }),
  getMessages: privateProcedure.input(
    z.object({
      chatId: z.string()
    })
  ).query(async({input, ctx}) => {
    try {
      const {chatId} = input
      const userId = ctx.user.id
      const messages = await prisma.message.findMany({
        where: {
          chatId,
          userId
        },
        orderBy: {
          createdAt: 'asc'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      })
      return messages
    } catch(error) {
      console.log('chatRouter getMessages error', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get messages'
      })
    }
  }),
  getChats: privateProcedure.query(async({ctx}) => {
    try {
      const userId = ctx.user.id
      const chats = await prisma.chat.findMany({
        where: {
          userId
        },
        include: {
          messages: {
            orderBy: {
              updatedAt: 'desc'
            },
            take: 1
          }
        }
      })
      chats.sort((a, b) => {
        const aLastMessage = a.messages[0]?.updatedAt.getTime() || 0
        const bLastMessage = b.messages[0]?.updatedAt.getTime() || 0
        return bLastMessage - aLastMessage
      })
      return chats
    } catch(error) {
      console.log('chatRouter getChats error', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get chats'
      })
    }
  })
})