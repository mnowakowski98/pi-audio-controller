import { IAudioMetadata } from 'music-metadata'

import AudioFileInfo from './audioFileInfo'

export default interface SoundFile {
    fileInfo: AudioFileInfo,
    metaData: IAudioMetadata
}