import express from 'express'
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.js';
import { deleteImage, downloadImage, getUserImages, searchImages, uploadImage } from '../controllers/image.controller.js';

const router = express.Router()


router.post('/upload' , authenticate , upload.single('image') , uploadImage)

router.get('/' , authenticate , getUserImages)

router.get('/search' , authenticate , searchImages)

router.delete('/:id' , authenticate , deleteImage)

router.get('/download/:id' , authenticate , downloadImage)
export default router;