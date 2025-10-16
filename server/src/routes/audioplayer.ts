import { createReadStream, writeFileSync } from 'node:fs'
import { copyFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { exec as execFunc } from 'node:child_process'
import { promisify } from 'node:util'
import findExec from 'find-exec'

// Init temp files for audio
const originalFile = join(tmpdir(), '/audioplayer-original')
const playingFile = join(tmpdir(), '/audioplayer-playing')
writeFileSync(originalFile, '')
writeFileSync(playingFile, '')

const exec = promisify(execFunc)
const ffmpeg = findExec('ffmpeg')
if (ffmpeg == null) console.error('ffmpeg not found')

import express from 'express'
import multer from 'multer'

import Speaker from 'speaker'
import { IAudioMetadata, parseBuffer } from 'music-metadata'
import Stream from 'node:stream'

const router = express.Router()
const upload = multer()

let speaker: Speaker | null = null
let audio: Stream.Readable | null = null

let playing = () => speaker?.closed == false
let paused = () => playing() == false && audio != null
let volume = 50
let loop = false
let overrideLoop = false

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
    overrideLoop = true
    audio?.emit('end')

    if (req.file == null) {
        res.statusCode = 400
        res.send('Missing file')
        return
    }

    fileName = req.body['name']
    try { metadata = await parseBuffer(req.file.buffer) }
    catch {
        res.statusCode = 400
        res.send('Must be a media file')
        return
    }
    await writeFile(originalFile, req.file.buffer)

    if (ffmpeg != null) await exec(`${ffmpeg} -i ${originalFile} -y -f s16le -acodec pcm_s16le ${playingFile}`)
    else await copyFile(originalFile, playingFile)

    res.send(getAudioInfo())
})
//#endregion

//#region Audio status
interface AudioStatus {
    playing: boolean,
    paused: boolean,
    loop: boolean,
    volume: number
}

const getAudioStatus = (): AudioStatus => ({
    playing: playing(),
    paused: paused(),
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
    const doLoop = loop == true && overrideLoop == false
    overrideLoop = false
    speaker?.close(doLoop)
    audio?.unpipe()
    audio?.destroy()
    if (doLoop) {
        speaker = new Speaker(getSpeakerSettings())
        audio = createReadStream(playingFile)
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
            if(playing() == true) break;
            if(speaker == null) speaker = new Speaker(getSpeakerSettings())
            if(audio == null) audio = createReadStream(playingFile)
            audio.pipe(speaker)
            audio.addListener('end', audioEnd)
            break
        case 'stop':
            overrideLoop = true
            audio?.emit('end')
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