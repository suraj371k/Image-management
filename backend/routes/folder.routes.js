import express from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { createFolder, deleteFolder, getFolder, getFolderChildren, getFolderTree, getUserFolders, updateFolder } from '../controllers/folder.controller.js'

const router = express.Router()

router.post('/' , authenticate , createFolder)

router.get('/' ,authenticate , getUserFolders)

router.get('/:id' , authenticate , getFolder)

router.delete('/:id' , authenticate , deleteFolder)

router.put('/:id' , authenticate , updateFolder)

router.get("/tree/all", authenticate, getFolderTree);     

router.get("/:id/children", authenticate , getFolderChildren);   


export default router;