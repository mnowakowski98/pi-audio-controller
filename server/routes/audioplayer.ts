import { createReadStream, writeFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// Init temp file for audio
const tempFile = join(tmpdir(), '/audioplayer-playing')
writeFileSync(tempFile, '')
console.debug(`Audio player: Using audio file path ${tempFile}`)

import express from 'express'
import multer from 'multer'
import Speaker from 'speaker'
import { IAudioMetadata, parseBuffer } from 'music-metadata'
import Stream from 'node:stream'

const router = express.Router()
const upload = multer()

//#region File info
interface AudioFileInfo {
    fileName: string | null,
    title: string | null,
    artist: string | null,
    duration: number | null
}

let fileName: string | null = null
let metadata: IAudioMetadata | null = null
const getAudioInfo = (): AudioFileInfo => ({
    fileName,
    title: metadata?.common.title ?? null,
    artist: metadata?.common.artist ?? null,
    duration: metadata?.format.duration ?? null
})

router.get('/file', async (_req, res) => res.send(getAudioInfo()))

router.post('/file', upload.single('file'), async (req, res) => {
    if (req.file == null) {
        res.sendStatus(400)
        return
    }

    fileName = req.body['name']
    await writeFile(tempFile, req.file.buffer)
    metadata = await parseBuffer(req.file.buffer)
    res.send(getAudioInfo())
})
//#endregion

//#region Audio status
interface AudioStatus {
    playing: boolean,
    loop: boolean,
    volume: number
}

let speaker: Speaker | null = null
let audio: Stream.Readable | null = null

let playing = () => speaker?.closed == false
let volume = 50
let loop = false

const getAudioStatus = (): AudioStatus => ({
    playing: playing(),
    loop,
    volume
})

router.get('/status', (_req, res) => {
    res.send(getAudioStatus())
})

const getSpeakerSettings = (): Speaker.Options  => {
    if (metadata == null) throw 'getSpeakerSettings requires an audio to be set'
    return {
        channels: metadata.format.numberOfChannels ?? 2,
        bitDepth: metadata.format.bitsPerSample ?? 16,
        sampleRate: metadata.format.sampleRate ?? 44100
    }
}

const audioEnd = () => {
    speaker?.close(true)
    audio?.unpipe()
    audio?.destroy()
    if (loop == true) {
        speaker = new Speaker(getSpeakerSettings())
        audio = createReadStream(tempFile, {
            start: 44
        })
        audio.pipe(speaker)
        audio.addListener('end', audioEnd)
        return
    }

    audio = null
    speaker = null
}

router.put('/status/playing', express.text(), (req, res) => {
    if (metadata == null) {
        res.statusCode = 400
        res.send('No file selected')
        return
    }

    switch(req.body) {
        case 'start':
            if(speaker == null) speaker = new Speaker(getSpeakerSettings())
            if(audio == null) audio = createReadStream(tempFile, {
                start: 44
            })
            audio.pipe(speaker)
            audio.addListener('end', audioEnd)
            break
        case 'stop':
            audio?.removeListener('end', audioEnd)
            audio?.unpipe()
            speaker?.close(false)
            audio?.destroy()
            speaker = null
            audio = null
            break
        case 'pause':
            audio?.removeListener('end', audioEnd)
            audio?.unpipe()
            speaker?.close(false)
            speaker = null
            break
        default:
            res.statusCode = 400
            res.send('Value must be "start" "stop" or "pause"')
            return
    }

    res.send(getAudioStatus())
})

router.put('/status/loop', express.text(), (req, res) => {
    if (req.body === undefined) loop = !loop
    else loop = req.body == 'true' ? true : false
    res.send(getAudioStatus())
})
//#endregion

export default router