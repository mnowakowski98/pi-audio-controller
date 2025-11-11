export default interface AudioFileInfo {
    id: string | 'none',
    fileName: string,
    title: string | null,
    artist: string | null,
    duration: number | null
}

export const audioFileInfoKey = 'audioFileInfo'