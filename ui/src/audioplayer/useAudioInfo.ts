import { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'

import SettingsContext from '../settingsContext'
import type AudioFileInfo from '../models/audioFileInfo'
import { audioFileInfoKey } from '../models/audioFileInfo'

export default function useAudioInfo() {
    const queryUrl = useContext(SettingsContext).hostUrl

    return useQuery<AudioFileInfo>({
        queryKey: [audioFileInfoKey],
        queryFn: async () => (await fetch(queryUrl)).json()
    })
}