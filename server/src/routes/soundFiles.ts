import { randomUUID } from 'node:crypto'
import { accessSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import express from 'express'
import multer from 'multer'
import { parseFile, parseBuffer, IAudioMetadata } from 'music-metadata'

import AudioFileInfo from '../models/audioFileInfo'

const router = express.Router()
const upload = multer()

export const soundsFolder = join(process.cwd(), '/sounds')
if(existsSync(soundsFolder) == false) mkdirSync(soundsFolder)
try { accessSync(soundsFolder) }
catch { throw `Fatal: Can't access sound folder: ${soundsFolder}` }

type SoundFile = {
    fileInfo: AudioFileInfo,
    metaData: IAudioMetadata
}

const soundFiles: SoundFile[] = []
const makeSoundFile = (fileName: string, metaData: IAudioMetadata) => ({
    fileInfo: {
        id: randomUUID(),
        fileName,
        title: metaData.common.title ?? 'No title',
        artist: metaData.common.artist ?? 'No artist',
        duration: metaData.format.duration ?? 0
    },
    metaData
})

readdirSync(soundsFolder).forEach(async (fileName, id) => {
    const fullPath = join(soundsFolder, fileName)
    let metaData: IAudioMetadata | null = null
    try { metaData = await parseFile(fullPath) }
    catch { console.error(`Found invalid file: ${fileName}`) }
    if (metaData == null) return
    soundFiles.push(makeSoundFile(fileName, metaData))
})

const getSoundFiles = () => soundFiles.map(file => file.fileInfo)

router.get('/', async (_req, res) => res.send(getSoundFiles()))

router.get('/:id', (req, res) => {
    const id = req.params.id
    const file = getSoundFiles().find(file => file.id == id)
    if (file == undefined) {
        res.sendStatus(400)
        return
    }

    res.send(file)
})

router.post('/', upload.single('file'), async (req, res) => {
    if (req.file == null) {
        res.statusCode = 400
        res.send('file can not be null')
        return
    }

    const fileName = req.body['name']
    if(fileName == null) {
        res.status(400).send('name can not be null')
        return
    }

    if(soundFiles.find(file => file.fileInfo.fileName == fileName) != undefined) {
        res.status(400).send('File name already exists')
        return
    }

    let metadata: IAudioMetadata | null = null;
    try { metadata = await parseBuffer(req.file.buffer) }
    catch {
        res.statusCode = 400
        res.send('File must be an audio file')
        return
    }

    await writeFile(join(soundsFolder, fileName), req.file.buffer)
    soundFiles.push(makeSoundFile(fileName, metadata))
    res.send(getSoundFiles())
})

router.delete('/:id', async (req, res) => {
    const id = req.params.id
    const file = soundFiles.find(file => file.fileInfo.id == id)
    if (file == undefined) {
        res.sendStatus(400)
        return
    }

    const index = soundFiles.indexOf(file)
    await rm(join(soundsFolder, file.fileInfo.fileName))
    soundFiles.splice(index, 1)
    res.send(getSoundFiles())
})

export default router