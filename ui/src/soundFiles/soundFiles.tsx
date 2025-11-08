import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import FilesTable from './filesTable'
import FileUploader from './fileUploader'
import { soundFileInfoKey } from '../models/soundFile'

export default function SoundFiles() {
    return <Container fluid>
        <Row>
            <Col>
                <FilesTable showDeleteButtons={true} />
            </Col>
        </Row>

        <hr />
        <Row>
            <Col>
                <FileUploader queryKey={soundFileInfoKey} />
            </Col>
        </Row>
    </Container>
}