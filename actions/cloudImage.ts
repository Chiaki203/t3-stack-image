import { TRPCError } from '@trpc/server';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export const createCloudImage = async(base64Image:string) => {
  try {
    const imageResponse = await cloudinary.v2.uploader.upload(base64Image, {
      resource_type: 'image',
      folder: 't3stack'
    })
    console.log('createCloudImage imageResponse', imageResponse)
    return imageResponse.secure_url
  } catch(error) {
    console.log('createCloudImage error', error)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Failed to upload image'
    })
  }
}

export const deleteCloudImage = async(publicId:string) => {
  try {
    await cloudinary.v2.uploader.destroy(publicId)
  } catch(error) {
    console.log('deleteCloudImage error', error)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Failed to delete image'
    })
  }
}