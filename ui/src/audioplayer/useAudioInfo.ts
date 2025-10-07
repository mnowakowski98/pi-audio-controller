import { useContext } from "react"
import { useQuery } from "@tanstack/react-query"

import SettingsContext from "../SettingsContext"

export const audioInfoQueryKey = 'audioInfo'

export default function useAudioInfo(urlOverride?: URL) {
    const baseUrl = useContext(SettingsContext).hostUrl
    const queryUrl = new URL('./file', urlOverride ?? baseUrl)

    return useQuery({
        queryKey: [audioInfoQueryKey],
        queryFn: async () => {
            const data = await fetch(queryUrl)
            return data.json()
        }
    })
}