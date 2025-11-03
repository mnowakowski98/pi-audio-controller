import express from 'express'
import multer from 'multer'

import { IAudioMetadata, parseBuffer } from 'music-metadata'

import {
    getAudioInfo,
    getAudioStatus,
    hasAudioFile,
    pauseAudio,
    setFile,
    setLoop,
    startAudio,
    stopAudio
} from '../repositories/audioStatus'

const router = express.Router()
const upload = multer()

//#region File info
router.get('/file', (_req, res) => res.send(getAudioInfo()))

router.post('/file', upload.single('file'), async (req, res) => {
    stopAudio()

    let metadata: IAudioMetadata | null = null
    if (req.file == null) {
        res.status(400).send('Missing file')
        return
    }

    const fileName = req.body['name']
    if(fileName == null) {
        res.status(400).send('Missing file name')
        return
    }

    try { metadata = await parseBuffer(req.file.buffer) }
    catch {
        res.status(400).send('Must be a media file')
        return
    }

    await setFile(metadata, req.file.buffer)
    res.send(getAudioInfo())
})
//#endregion

//#region Audio status
router.get('/status', (_req, res) => res.send(getAudioStatus()))

router.put('/status/playing', express.text(), (req, res) => {
    if(hasAudioFile() == false) {
        res.status(400).send('No file selected')
        return
    }

    switch(req.body) {
        case 'start':
            startAudio()
            break
        case 'stop':
            stopAudio()
            break
        case 'pause':
            pauseAudio()
            break
        default:
            res.status(400).send('Value must be "start" "stop" or "pause"')
            return
    }

    res.send(getAudioStatus())
})

router.put('/status/loop', express.text(), (req, res) => {
    if (req.body === undefined) setLoop()
    else setLoop(req.body == 'true' ? true : false)
    res.send(getAudioStatus())
})
//#endregion

export default router