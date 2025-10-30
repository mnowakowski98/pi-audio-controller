import { useContext, useState, type ChangeEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import SettingsContext from '../settingsContext'
import FilesTable from './filesTable'

export default function SoundFiles() {
    const baseUrl = useContext(SettingsContext).hostUrl
    const queryClient = useQueryClient()

    const queryKey = 'soundFileInfo'

    const [audioFile, setAudioFile] = useState<File | null>()

    const postFile = useMutation({
        mutationFn: async () => {
            const data = new FormData()
            data.append('file', audioFile!)
            data.append('name', audioFile!.name)
            const response = await fetch(baseUrl, {
                method: 'POST',
                body: data
            })
            return await response.json()
        },
        onSuccess: (data) => queryClient.setQueryData([queryKey], data)
    })

    return <Container fluid>
        <Row>
            <Col>
                <FilesTable />
            </Col>
        </Row>

        <hr />
        <Row>
            <Col>
                <InputGroup>
                    <Form.Control
                        type='file'
                        onChange={(event: ChangeEvent<HTMLInputElement>) => setAudioFile(event.target.files?.item(0))}
                    />
                    <Button onClick={() => postFile.mutate()}>Submit</Button>
                </InputGroup>
            </Col>
        </Row>
    </Container>
}