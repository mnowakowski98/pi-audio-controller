export default interface AudioFileInfo {
    id: string,
    fileName: string,
    title: string | null,
    artist: string | null,
    duration: number | null
}

export const audioFileInfoKey = 'audioFileInfo'