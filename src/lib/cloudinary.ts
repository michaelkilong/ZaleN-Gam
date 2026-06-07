import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: string, folder: string = 'zalen-gam'): Promise<string> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: 'auto',
  });
  return result.secure_url;
}

export default cloudinary;
