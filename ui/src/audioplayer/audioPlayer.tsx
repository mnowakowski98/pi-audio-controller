import { useContext, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Button from 'react-bootstrap/Button'

import AudioInfo from './audioInfo'
import PlayerControls from './playerControls'
import FileUploader from '../soundFiles/fileUploader'
import FilesTable from '../soundFiles/filesTable'
import ClearButton from './clearButton'

import useAudioInfo from './useAudioInfo'
import settingsContext from '../settingsContext'
import { audioFileInfoKey } from '../models/audioFileInfo'

export default function AudioPlayer() {
    const baseUrl = useContext(settingsContext).hostUrl
    const queryClient = useQueryClient()

    const audioInfo = useAudioInfo()
    const hasFile = audioInfo.data != null

    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const setFile = useMutation({
        mutationFn: async () => (await fetch(new URL(`./${selectedFile}`, baseUrl), { method: 'POST' })).json(),
        onSuccess: (data) => queryClient.setQueryData([audioFileInfoKey], data)
    })

    return <Container fluid>
        <Row className='mt-3 mb-2'>
            <Col xs={9}>
                <FileUploader
                    children={<ClearButton clearId={selectedFile} hasFile={hasFile} />}
                />
            </Col>
            <Col>
                <PlayerControls hasFile={hasFile} />
            </Col>
        </Row>

        {hasFile && <hr />}
        {hasFile && <Row>
            <AudioInfo />
        </Row>}

        <hr />
        <Row>
            <Col>
                <FilesTable
                    baseUrlOverride={new URL('../soundfiles/', baseUrl)}
                    showDeleteButtons={false}
                    selectedFileId={selectedFile}
                    onSelect={(id: string) => setSelectedFile(id)}
                />
                <Button
                    type='button'
                    className='d-block w-100'
                    disabled={selectedFile == null || setFile.isPending == true}
                    onClick={() => setFile.mutate()}
                >Set selected file</Button>
            </Col>
        </Row>
    </Container>
}