import { useContext } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'

import SettingsContext from '../SettingsContext'

interface PlayerControlsProps {
    hasFile: boolean
}

export default function PlayerControls(props: PlayerControlsProps) {
    const baseUrl = useContext(SettingsContext).hostUrl
    const queryClient = useQueryClient()

    const audioStatus = useQuery({
        queryKey: ['audioStatus'],
        queryFn: async () => {
            const data = await fetch(`${baseUrl}/status`)
            return data.json()
        }
    })

    const setPlayingState = useMutation({
        mutationFn: async (command: 'start' | 'pause' | 'stop') => {
            const response = await fetch(`${baseUrl}/status/playing`, {
                method: 'PUT', body: command
            })
            return response.json()
        },
        onSuccess: (data) => queryClient.setQueryData(['audioStatus'], data)
    })

    const setLoopState = useMutation({
        mutationFn: async (loop: boolean) => {
            const response = await fetch(`${baseUrl}/status/loop`, {
                method: 'PUT', body: loop ? 'true' : 'false'
            })
            return response.json()
        },
        onSuccess: (data) => queryClient.setQueryData(['audioStatus'], data)
    })

    if (audioStatus.isLoading) return 'Loading'
    if (audioStatus.isError) return 'Goofed'

    return <InputGroup className='justify-content-end'>
        <InputGroup.Text className={`text-light ${audioStatus.data.loop ? 'bg-success' : 'bg-secondary'}`}>
            <Form.Check reverse label='Loop' checked={audioStatus.data.loop} onChange={(event) => setLoopState.mutate(event.target.checked)} />
        </InputGroup.Text>
        <Button
            type='button'
            disabled={audioStatus.data.playing == true || props.hasFile == false}
            onClick={() => setPlayingState.mutate('start')}>
            Start
        </Button>
        <Button type='button' disabled={audioStatus.data.playing == false} onClick={() => setPlayingState.mutate('pause')}>Pause</Button>
        <Button
            type='button'
            disabled={audioStatus.data.playing == false && audioStatus.data.paused == false}
            onClick={() => setPlayingState.mutate('stop')}>
            Stop
        </Button>
    </InputGroup>
}