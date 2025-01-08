import {v2 as cloudinary} from 'cloudinary';
import {config} from 'dotenv'

config()

cloudinary.config({
    cloud_name: process.env.cloudinary,
    api_key: process.env.CLOUD_API,
    api_secret: process.env.CLOUD_SECRET
})

export default cloudinary;