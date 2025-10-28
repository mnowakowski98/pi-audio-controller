import express from 'express'
import multer from 'multer'
import { parseBuffer } from 'music-metadata'
import { accessSync, existsSync, mkdirSync } from 'node:fs'
import { readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import AudioFileInfo from '../models/audioFileInfo'
import { parseFile } from 'music-metadata'

const router = express.Router()
const upload = multer()

const soundFolder = join(process.cwd(), '/sounds')
if(existsSync(soundFolder) == false) mkdirSync(soundFolder)
try { accessSync(soundFolder) }
catch { throw `Fatal: Can't access sound folder: ${soundFolder}` }

const getSoundFiles = async (): Promise<AudioFileInfo[]> => {
    const files = await readdir(soundFolder)
    const metadatas = await Promise.all(files.map(file => parseFile(join(soundFolder, file))))
    return metadatas.map((metadata, index) => ({
        fileName: files.at(index) ?? 'No file name (this is an error)',
        title: metadata.common.title ?? 'No title',
        artist: metadata.common.artist ?? 'No artist',
        duration: metadata.format.duration ?? 0
    }))
}
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