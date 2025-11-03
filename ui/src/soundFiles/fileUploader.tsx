import { type ChangeEvent, type ReactElement, useContext, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import settingsContext from '../settingsContext'

export default function FileUploader(props: { children?: ReactElement }) {
    const uploadUrl = useContext(settingsContext).hostUrl
    const queryClient = useQueryClient()

    const fileInput = useRef<HTMLInputElement | null>(null)
    const [audioFile, setAudioFile] = useState<File | null>()

    const uploadFile = useMutation({
        mutationFn: async () => {
            if (audioFile == null) return null
            const body = new FormData()
            body.append('file', audioFile!)
            body.append('name', audioFile!.name)
            const response = await fetch(uploadUrl, { method: 'POST', body })
            return response.json()
        },
        onSuccess: (data) => {
            if (data == null) return
            queryClient.setQueryData(['soundFileInfo'], data)
            setAudioFile(null)
            if (fileInput.current != null) fileInput.current.value = ''
        }
    })

    return <InputGroup>
        <InputGroup.Text>Upload audio</InputGroup.Text>
        <Form.Control
            ref={fileInput}
            type='file'
            disabled={uploadFile.isPending}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setAudioFile(event.target.files?.item(0))}
        />
        <Button
            type='button'
            disabled={audioFile == null || uploadFile.isPending == true}
            onClick={() => uploadFile.mutate()}
        >Upload</Button>
        {props.children}
    </InputGroup>
}