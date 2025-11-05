import { type IAudioMetadata } from 'music-metadata'

import type AudioFileInfo from './audioFileInfo'

export default interface SoundFile {
    fileInfo: AudioFileInfo,
    metadata: IAudioMetadata
}

export const soundFileInfoKey = 'soundFileInfo'