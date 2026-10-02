import { useCallback, useEffect, useRef, useState } from 'react'

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null

/**
 * Thin wrapper over the Web Speech API.
 * onFinalResult(transcript) fires once per completed utterance.
 */
export function useSpeechRecognition(onFinalResult) {
  const isSupported = Boolean(SpeechRecognition)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)
  const callbackRef = useRef(onFinalResult)
  callbackRef.current = onFinalResult

  useEffect(() => {
    if (!isSupported) return
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim()
      if (transcript) callbackRef.current?.(transcript)
    }
    recognition.onerror = (event) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setError(`Microphone error: ${event.error}`)
      }
    }
    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
    return () => {
      recognition.onresult = recognition.onerror = recognition.onend = null
      try { recognition.abort() } catch { /* ignore */ }
    }
  }, [isSupported])

  const start = useCallback(() => {
    if (!recognitionRef.current || listening) return
    setError('')
    try {
      recognitionRef.current.start()
      setListening(true)
    } catch {
      // start() throws if already started; ignore.
    }
  }, [listening])

  const stop = useCallback(() => {
    try { recognitionRef.current?.stop() } catch { /* ignore */ }
    setListening(false)
  }, [])

  return { isSupported, listening, error, start, stop }
}
