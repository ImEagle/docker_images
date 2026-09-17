import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('posts the entered text to the same-origin echo endpoint and displays the reply', async () => {
    fetch.mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue('Hello: hello'),
    })
    render(<App />)

    fireEvent.change(screen.getByLabelText(/request body/i), { target: { value: 'hello' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByRole('status')).toHaveTextContent('Sending request')
    await waitFor(() => expect(screen.getByText('Hello: hello')).toBeInTheDocument())
    expect(fetch).toHaveBeenCalledWith('/api/echo', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'hello',
    })
  })

  it('renders an API error', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: vi.fn().mockResolvedValue('Body is invalid'),
    })
    render(<App />)

    fireEvent.change(screen.getByLabelText(/request body/i), { target: { value: 'hello' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Body is invalid')
  })

  it('keeps submission disabled until text is entered', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
  })
})
