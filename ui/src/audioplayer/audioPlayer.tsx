import { useContext, useState } from 'react'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import AudioInfo from './audioInfo'
import AudioUploader from './audioUploader'
import PlayerControls from './playerControls'

import SettingsContext from '../SettingsContext'

export default function AudioPlayer() {
    const serverUrl = useContext(SettingsContext).serverUrl.concat('/audioplayer')
    const [hasFile, setHasFile] = useState(false)

    return <SettingsContext value={{ serverUrl }}>
        <Container fluid>
            <Row className='mt-3 mb-2'>
                <Col xs={9}>
                    <AudioUploader onFileUpload={() => setHasFile(true)} />
                </Col>
                <Col>
                    <PlayerControls hasFile={hasFile} />
                </Col>
            </Row>
            <hr />
            {hasFile && <Row>
                <AudioInfo />
            </Row>}
        </Container>
    </SettingsContext>
}