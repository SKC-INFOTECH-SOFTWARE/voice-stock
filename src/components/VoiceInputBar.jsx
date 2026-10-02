import { useEffect, useRef, useState } from 'react'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import MicIcon from '@mui/icons-material/Mic'
import StopIcon from '@mui/icons-material/Stop'
import AddIcon from '@mui/icons-material/Add'
import { parseVoice, ApiError } from '../api/client'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'

export default function VoiceInputBar({ onAddLine }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [candidates, setCandidates] = useState([])
  const inputRef = useRef(null)

  async function submit(raw) {
    const value = (raw ?? text).trim()
    if (!value || busy) return
    setBusy(true)
    setError('')
    setCandidates([])
    try {
      const res = await parseVoice(value)
      onAddLine({
        item_id: res.item_id,
        code: res.code,
        name: res.name,
        unit_rate: res.unit_rate,
        quantity: res.quantity,
        line_total: res.line_total,
      })
      setText('')
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && err.data.candidates) {
        setCandidates(err.data.candidates)
        setError('Multiple matches — pick one:')
      } else {
        setError(err.message)
      }
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }

  const { isSupported, listening, error: micError, start, stop } = useSpeechRecognition((transcript) => {
    setText(transcript)
    submit(transcript)
  })

  useEffect(() => {
    if (micError) setError(micError)
  }, [micError])

  function pickCandidate(c) {
    const quantity = 1
    onAddLine({
      item_id: c.item_id,
      code: c.code,
      name: c.name,
      unit_rate: c.unit_rate,
      quantity,
      line_total: Math.round(c.unit_rate * quantity * 100) / 100,
    })
    setCandidates([])
    setError('')
    inputRef.current?.focus()
  }

  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, displayPrint: 'none' }}>
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <TextField
          inputRef={inputRef}
          fullWidth
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={isMobile ? 'e.g. rice 1kg quantity 2' : 'Speak or type — e.g. "item122 x 3", "rice 5", "rice 1kg quantity 2"'}
          disabled={busy}
          slotProps={{
            input: {
              endAdornment: isSupported ? (
                <InputAdornment position="end">
                  <Tooltip title={listening ? 'Stop' : 'Speak'}>
                    <IconButton
                      onClick={listening ? stop : start}
                      color={listening ? 'error' : 'default'}
                      edge="end"
                      aria-label="voice input"
                      sx={listening ? {
                        animation: 'pulse 1s infinite',
                        '@keyframes pulse': {
                          '0%': { opacity: 1 },
                          '50%': { opacity: 0.4 },
                          '100%': { opacity: 1 },
                        },
                      } : undefined}
                    >
                      {listening ? <StopIcon /> : <MicIcon />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ) : null,
            },
          }}
        />
        {isMobile ? (
          <IconButton
            color="primary"
            onClick={() => submit()}
            disabled={busy}
            aria-label="add item"
            sx={{ border: 1, borderColor: 'divider', borderRadius: 2, height: 40, width: 40 }}
          >
            <AddIcon />
          </IconButton>
        ) : (
          <Button variant="contained" onClick={() => submit()} disabled={busy} endIcon={<AddIcon />} sx={{ px: 3, whiteSpace: 'nowrap' }}>
            {busy ? 'Adding…' : 'Add'}
          </Button>
        )}
      </Stack>

      {!isSupported && (
        <Alert severity="info" sx={{ mt: 1.5 }}>
          Voice input needs Chrome or Edge. Typing works everywhere.
        </Alert>
      )}
      {error && <Alert severity={candidates.length ? 'warning' : 'error'} sx={{ mt: 1.5 }}>{error}</Alert>}
      {candidates.length > 0 && (
        <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {candidates.map((c) => (
            <Chip key={c.item_id} label={`${c.code} · ${c.name}`} onClick={() => pickCandidate(c)} color="primary" variant="outlined" clickable />
          ))}
        </Box>
      )}
    </Paper>
  )
}
