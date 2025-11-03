import { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'

import SettingsContext from '../settingsContext'
import type AudioFileInfo from '../models/audioFileInfo'

export const audioInfoQueryKey = 'soundFileInfo'

export default function useAudioInfo() {
    const queryUrl = useContext(SettingsContext).hostUrl

    return useQuery<AudioFileInfo>({
        queryKey: [audioInfoQueryKey],
        queryFn: async () => {
            const data = await fetch(queryUrl)
            return data.json()
        }
    })
}