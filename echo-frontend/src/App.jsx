import { useState } from 'react'

export default function App() {
  const [body, setBody] = useState('')
  const [status, setStatus] = useState('idle')
  const [response, setResponse] = useState(null)
  const [error, setError] = useState('')

  async function sendEcho(event) {
    event.preventDefault()
    if (!body.trim()) {
      setResponse('')
      setError('Enter some text before sending.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setResponse(null)
    setError('')

    try {
      const result = await fetch('/api/echo', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body,
      })
      const payload = await result.text()

      if (!result.ok) {
        throw new Error(
          typeof payload === 'string' && payload
            ? payload
            : `Request failed with status ${result.status}`,
        )
      }

      setResponse(payload)
      setStatus('success')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Request failed')
      setStatus('error')
    }
  }

  return (
    <main>
      <section aria-labelledby="page-title">
        <p className="eyebrow">Same-origin API client</p>
        <h1 id="page-title">Echo API</h1>
        <form onSubmit={sendEcho}>
          <label htmlFor="echo-body">Request body</label>
          <textarea
            id="echo-body"
            name="body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write something to echo"
            rows="7"
            disabled={status === 'loading'}
          />
          <button type="submit" disabled={status === 'loading' || !body.trim()}>
            {status === 'loading' ? 'Sending…' : 'Send'}
          </button>
        </form>

        {status === 'loading' && <p role="status">Sending request…</p>}
        {status === 'error' && <p className="error" role="alert">{error}</p>}
        {status === 'success' && (
          <section className="reply" aria-labelledby="response-title">
            <h2 id="response-title">Response</h2>
            <output aria-live="polite">{response}</output>
          </section>
        )}
      </section>
    </main>
  )
}
