import { useContext } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'

import settingsContext from '../settingsContext'
import type AudioFileInfo from '../models/audioFileInfo'

export default function FilesTable() {
    const baseUrl = useContext(settingsContext).hostUrl
    const queryClient = useQueryClient()

    const soundFiles = useQuery<AudioFileInfo[]>({
        queryKey: ['soundFileInfo'],
        queryFn: async () => {
            const data = await fetch(baseUrl)
            return await data.json()
        }
    })

    const removeFile = useMutation({
        mutationFn: async (id: number) => {
            const response = await fetch(new URL(`./${id}`, baseUrl), { method: 'Delete' })
            return response.json()
        },
        onSuccess: (data) => queryClient.setQueryData(['soundFileInfo'], data)
    })

    if (soundFiles.isLoading == true) return 'Loading'
    if (soundFiles.isError == true) return 'Goofed'

    return <Table>
        <thead>
            <tr>
                <th>Filename</th>
                <th>Title</th>
                <th>Artist</th>
                <th>Duration</th>
            </tr>
        </thead>
        <tbody>
            {soundFiles.data?.map((file) =>
                <tr key={file.id}>
                    <td>{file.fileName}</td>
                    <td>{file.title}</td>
                    <td>{file.artist}</td>
                    <td>{file.duration?.toFixed(2)}</td>
                    <td>
                        <Button
                            type='button'
                            onClick={() => removeFile.mutate(file.id)}
                        >X</Button>
                    </td>
                </tr>
            )}
        </tbody>
    </Table>
}