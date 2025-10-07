import { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'

import Col from 'react-bootstrap/Col'

import SettingsContext from '../SettingsContext'

export default function AudioInfo() {
    const baseUrl = useContext(SettingsContext).serverUrl

    const audioInfo = useQuery({
        queryKey: ['audioInfo'],
        queryFn: async () => {
            const data = await fetch(`${baseUrl}/file`)
            return data.json()
        }
    })

    if (audioInfo.isLoading) return 'Loading'
    if (audioInfo.isError) return 'Goofed'

    return <>
        <Col className='text-center'>{audioInfo.data.fileName ?? 'No file'}</Col>
        <Col className='text-center'>{audioInfo.data.title ?? '(No title)'}</Col>
        <Col className='text-center'>{audioInfo.data.artist ?? '(No artist)'}</Col>
    </>
}