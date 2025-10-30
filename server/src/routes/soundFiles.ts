import express from 'express'
import multer from 'multer'

import { accessSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

import { parseFile, parseBuffer, IAudioMetadata } from 'music-metadata'

import AudioFileInfo from '../models/audioFileInfo'
import { AudioFileInfo as AudioFileInfoDTO } from '../dtos/audioFileInfo'

const router = express.Router()
const upload = multer()

export const soundsFolder = join(process.cwd(), '/sounds')
if(existsSync(soundsFolder) == false) mkdirSync(soundsFolder)
try { accessSync(soundsFolder) }
catch { throw `Fatal: Can't access sound folder: ${soundsFolder}` }

const soundsDatabase = new DatabaseSync(':memory:')
soundsDatabase.exec('create table SoundFiles \
    (Id integer primary key, \
    FileName nvarchar not null, \
    Title nvarchar, \
    Artist nvarchar, \
    Duration decimal)')

const getInfoFromMetadata = (metadata: IAudioMetadata, fileName: string, id?: number) => ({
    id: id ?? 0,
    fileName,
    title: metadata.common.title ?? 'No title',
    artist: metadata.common.artist ?? 'No artist',
    duration: metadata.format.duration ?? 0
}) 

const existingFiles = readdirSync(soundsFolder)
for (const file of existingFiles) {
    const fullPath = join(soundsFolder, file)
    parseFile(fullPath).then(metadata => {
        const dto = new AudioFileInfoDTO(soundsDatabase, getInfoFromMetadata(metadata, file))
        dto.insert()
    })
}

const getSoundFiles = async (): Promise<AudioFileInfo[]> => {
    const statement = soundsDatabase.prepare('select * from SoundFiles')
    const results = statement.all()
    return results.map<AudioFileInfo>(result => ({
        id: parseInt(result['Id']?.toString() ?? '0'),
        fileName: result['FileName']?.toString() ?? 'Init goofed',
        title: result['Title']?.toString() ?? 'Init goofed',
        artist: result['Artist']?.toString() ?? 'Init goofed',
        duration: parseFloat(result['Duration']?.toString() ?? '0')
    }))
}

router.get('/', async (_req, res) => res.send(await getSoundFiles()))
router.get('/:id', async (req, res) => {
    const dto = new AudioFileInfoDTO(soundsDatabase)
    dto.get(parseInt(req.params.id))
    const fileInfo = dto.audioFileInfo
    if (fileInfo == undefined) {
        res.sendStatus(404)
        return
    }

    res.send(fileInfo)
})

router.post('/', upload.single('file'), async (req, res) => {
    if (req.file == null) {
        res.statusCode = 400
        res.send('File can not be null')
        return
    }

    let metadata: IAudioMetadata | null = null;
    try { metadata = await parseBuffer(req.file.buffer) }
    catch {
        res.statusCode = 400
        res.send('File must be an audio file')
        return
    }

    const dto = new AudioFileInfoDTO(soundsDatabase, getInfoFromMetadata(metadata, req.body['name']))
    const didInsert = await dto.insert(req.file.buffer)
    if (didInsert == false) throw 'Failed to update file list'

    res.send(await getSoundFiles())
})

router.delete('/:id', async (req, res) => {
    if (req.params.id == null) {
        res.statusCode = 400
        res.send('Id param can not be null')
    }

    const dto = new AudioFileInfoDTO(soundsDatabase)
    await dto.delete(parseInt(req.params.id))

    res.send(await getSoundFiles())
})

export default router