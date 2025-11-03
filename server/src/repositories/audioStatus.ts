import { exec as execFunc } from 'node:child_process'
import { createReadStream, writeFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

import Speaker, { Stream } from 'speaker'
import { IAudioMetadata } from 'music-metadata'
import findExec from 'find-exec'

import AudioStatus from '../models/audioStatus'
import AudioFileInfo from '../models/audioFileInfo'

// Init temp files for audio
const originalFile = join(tmpdir(), '/audioplayer-original')
const playingFile = join(tmpdir(), '/audioplayer-playing')
writeFileSync(originalFile, '')
writeFileSync(playingFile, '')

// Crash out if ffmpeg isn't available
const exec = promisify(execFunc)
const ffmpeg = findExec('ffmpeg')
if (ffmpeg == null) throw('ffmpeg not found')

let speaker: Speaker | null = null
let audio: Stream.Readable | null = null

let uploadedFileName = 'None'
let metadata: IAudioMetadata | null = null

const playing = () => speaker?.closed == false
const paused = () => playing() == false && audio != null
let volume = 50
let loop = false

export const getLoop = () => loop
export const setLoop = (doLoop?: boolean) => { loop = doLoop !== undefined ? doLoop : !loop }

const getSpeakerSettings = (): Speaker.Options  => {
    if (metadata == null) throw 'getSpeakerSettings requires an audio to be set'
    return {
        channels: metadata.format.numberOfChannels ?? 2,
        bitDepth: metadata.format.bitsPerSample ?? 16,
        sampleRate: metadata.format.sampleRate ?? 44100
    }
}

export const getAudioStatus = (): AudioStatus => ({
    playing: playing(),
    paused: paused(),
    loop,
    volume
})

export const hasAudioFile = () => metadata != null && uploadedFileName != null

export const getAudioInfo = (): AudioFileInfo | null => (hasAudioFile() ? {
    id: 'playing',
    fileName: uploadedFileName,
    title: metadata?.common.title ?? 'No title',
    artist: metadata?.common.artist ?? 'No artist',
    duration: metadata?.format.duration ?? 0
} : null)

export const setFile = async (_metadata: IAudioMetadata, fileData: Buffer) => {
    metadata = _metadata
    await writeFile(originalFile, fileData)
    await exec(`${ffmpeg} -i ${originalFile} -y -f s16le -acodec pcm_s16le ${playingFile}`)
}

const audioEnd = (overrideLoop = false) => {
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

export const startAudio = () => {
    if(hasAudioFile() == false) throw `Can not play audio when no file is set`
    if(playing() == true) return;
    if(speaker == null) speaker = new Speaker(getSpeakerSettings())
    if(audio == null) audio = createReadStream(playingFile)
    audio.pipe(speaker)
    audio.addListener('end', audioEnd)
}

export const pauseAudio = () => {
    audio?.unpipe()
    speaker?.close(false)
    speaker = null
}

export const stopAudio = () => {
    audio?.unpipe()
    audio?.emit('end', true)
    audio?.removeListener('end', audioEnd)
}