import { useContext } from 'react'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import AudioInfo from './audioInfo'
import AudioUploader from './audioUploader'
import PlayerControls from './playerControls'

import SettingsContext from '../SettingsContext'
import useAudioInfo from './useAudioInfo'

export default function AudioPlayer() {
    const settings = useContext(SettingsContext)
    const playerBasePath = new URL('./audioplayer/', settings.hostUrl)

    const audioInfo = useAudioInfo(playerBasePath)
    const hasFile = audioInfo.isLoading == false && audioInfo.data.fileName != null

    return <SettingsContext value={{ hostUrl: playerBasePath }}>
        <Container fluid>
            <Row className='mt-3 mb-2'>
                <Col xs={9}>
                    <AudioUploader />
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
    </SettingsContext>
}