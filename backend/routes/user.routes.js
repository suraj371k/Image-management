import express from 'express'
import { getUserProfile, login, logout, register } from '../controllers/user.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/register' , register)

router.post('/login' , login)

router.post('/logout' , authenticate , logout)

router.get('/profile' , authenticate , getUserProfile)

export default router;