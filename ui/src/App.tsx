import './App.css'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'

import { useState, type ChangeEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Form } from 'react-bootstrap'

const baseUrl = 'http://localhost:3000/audioplayer'

export default function App() {
  const queryClient = useQueryClient()

  const audioInfo = useQuery({
    queryKey: ['audioInfo'],
    queryFn: async () => {
      const data = await fetch(`${baseUrl}/file`)
      return data.json()
    }
  })

  const audioStatus = useQuery({
    queryKey: ['audioStatus'],
    queryFn: async () => {
      const data = await fetch(`${baseUrl}/status`)
      return data.json()
    }
  })

  const [audioFile, setAudioFile] = useState<File | null>()

  const postFile = useMutation({
    mutationFn: async () => {
      const data = new FormData()
      data.append('file', audioFile!)
      data.append('name', audioFile!.name)
      const response = await fetch(`${baseUrl}/file`, {
        method: 'POST',
        body: data
      })
      return await response.json()
    },
    onSuccess: (data) => queryClient.setQueryData(['audioInfo'], data)
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

  if (audioInfo.isError || audioStatus.isError) return 'Goofed'
  if (audioInfo.isLoading || audioStatus.isLoading) return 'Loading'

  return <Container fluid>
    <Row className='mt-3 mb-2'>
      <Col xs={9}>
        <InputGroup>
          <InputGroup.Text>Upload audio</InputGroup.Text>
          <Form.Control type='file' onChange={(event: ChangeEvent<HTMLInputElement>) => setAudioFile(event.target.files?.item(0))} />
          <Button type='button' onClick={() => postFile.mutate()}>Submit</Button>
        </InputGroup>
      </Col>

      <Col>
        <InputGroup className='justify-content-end'>
          <InputGroup.Text className={`text-light ${audioStatus.data.loop ? 'bg-success' : 'bg-secondary'}`}>
            <Form.Check reverse label='Loop' checked={audioStatus.data.loop} onChange={(event) => setLoopState.mutate(event.target.checked)} />
          </InputGroup.Text>
          <Button
            type='button'
            disabled={audioStatus.data.playing == true || audioInfo.data.fileName == null}
            onClick={() => setPlayingState.mutate('start')}>
              Start
          </Button>
          <Button type='button' disabled={audioStatus.data.playing == false} onClick={() => setPlayingState.mutate('pause')}>Pause</Button>
          <Button type='button' disabled={audioStatus.data.playing == false} onClick={() => setPlayingState.mutate('stop')}>Stop</Button>
        </InputGroup>
      </Col>
    </Row>

    <hr />

    <Row>
      <Col className='text-center'>{audioInfo.data.fileName ?? 'No file'}</Col>
      <Col className='text-center'>{audioInfo.data.title ?? '(No title)'}</Col>
      <Col className='text-center'>{audioInfo.data.artist ?? '(No artist)'}</Col>
    </Row>
  </Container>
}
