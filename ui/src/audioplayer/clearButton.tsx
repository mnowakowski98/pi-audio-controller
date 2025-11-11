import { useContext } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import Button from 'react-bootstrap/Button'

import settingsContext from '../settingsContext'
import { audioFileInfoKey } from '../models/audioFileInfo'

interface ClearButtonProps {
    hasFile: boolean
}

export default function ClearButton(props: ClearButtonProps) {
    const url = useContext(settingsContext).hostUrl
    const queryClient = useQueryClient()
    
    const clearFile = useMutation({
        mutationFn: async () => (await fetch(url, { method: 'DELETE' })),
        onSuccess: () => queryClient.fetchQuery({
            queryKey: [audioFileInfoKey]
        })
    })

    return <Button
        type='button'
        disabled={clearFile.isPending == true || props.hasFile == false}
        onClick={() => clearFile.mutate()}>
        Clear file
    </Button>
}