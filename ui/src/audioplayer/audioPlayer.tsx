import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import AudioInfo from './audioInfo'
import PlayerControls from './playerControls'

import useAudioInfo from './useAudioInfo'
import SettingsContext from '../settingsContext'
import { useContext } from 'react'
import settingsContext from '../settingsContext'
import FileUploader from '../soundFiles/fileUploader'

export default function AudioPlayer() {
    const audioInfo = useAudioInfo()
    const hasFile = audioInfo.isLoading == false && audioInfo.data?.fileName != null

    return <Container fluid>
        <Row className='mt-3 mb-2'>
            <Col xs={9}>
                <SettingsContext value={{ hostUrl: new URL('./file', useContext(settingsContext).hostUrl) }}>
                    <FileUploader />
                </SettingsContext>
            </Col>
            <Col>
                <PlayerControls hasFile={hasFile} />
            </Col>
        </Row>
        {hasFile && <hr />}
        {hasFile && <Row>
            <AudioInfo />
        </Row>}
    </Container>
}