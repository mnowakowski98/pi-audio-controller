import { useContext, useState } from 'react'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'

import type { Settings } from '../SettingsContext'
import SettingsContext from '../SettingsContext'

interface SettingsProps {
    onUpdate: (settings: Settings) => void
}

export default function Settings(props: SettingsProps) {
    const settings = useContext(SettingsContext)
    const [hostUrl, setHostUrl] = useState(settings.hostUrl)

    const getSettings = (): Settings => ({
        hostUrl
    })

    return <Container>
        <Row>
            <Col>
                <Form.Text>Host URL</Form.Text>
                <InputGroup>
                    <Form.Control
                        type='text'
                        value={hostUrl}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setHostUrl(event.target.value)}
                    />
                    <Button onClick={() => props.onUpdate(getSettings())}>Set</Button>
                </InputGroup>
            </Col>
        </Row>
    </Container>
}