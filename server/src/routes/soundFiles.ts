import express from 'express'
import multer from 'multer'
import { parseBuffer } from 'music-metadata'
import { accessSync, existsSync, mkdirSync } from 'node:fs'
import { readdir, writeFile } from 'node:fs/promises'
import { join, normalize } from 'node:path'

const router = express.Router()
const upload = multer()

const soundFolder = normalize(join(process.cwd(), '/sounds'))
if(existsSync(soundFolder) == false) mkdirSync(soundFolder)
try { accessSync(soundFolder) }
catch { throw `Fatal: Can't access sound folder: ${soundFolder}` }


const getSoundFiles = () => readdir(soundFolder);
router.get('/', async (_req, res) => res.send(await getSoundFiles()))

router.post('/', upload.single('file'), async (req, res) => {
    if (req.file == null) {
        res.statusCode = 400
        res.send('File can not be null')
        return
    }

    try { const metadata = await parseBuffer(req.file.buffer) }
    catch {
        res.statusCode = 400
        res.send('File must be an audio file')
        return
    }

    await writeFile(join(soundFolder, req.file.filename), req.file.buffer)
    res.send(await getSoundFiles())
})

export default router