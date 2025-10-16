import { useContext, useState, type ChangeEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'

import SettingsContext from '../SettingsContext'
import { audioInfoQueryKey } from './useAudioInfo'

export default function AudioUploader() {
    const baseUrl = useContext(SettingsContext).hostUrl
    const queryClient = useQueryClient()

    const [audioFile, setAudioFile] = useState<File | null>()

    const postFile = useMutation({
        mutationFn: async () => {
            const data = new FormData()
            data.append('file', audioFile!)
            data.append('name', audioFile!.name)
            const response = await fetch(new URL(`./file`, baseUrl), {
                method: 'POST',
                body: data
            })
            return await response.json()
        },
        onSuccess: (data) => queryClient.setQueryData([audioInfoQueryKey], data)
    })

    return <InputGroup>
        <InputGroup.Text>Upload audio</InputGroup.Text>
        <Form.Control
            type='file'
            disabled={postFile.isPending}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setAudioFile(event.target.files?.item(0))}
        />
        <Button type='button' disabled={postFile.isPending} onClick={() => postFile.mutate()}>Submit</Button>
    </InputGroup>
}