import React from 'react'
import { render, screen } from '@testing-library/react'
import Spinner from './Spinner'

test('renders when on is true', () => {
  render(<Spinner on={true} />)
  const spinner = screen.getByText(/please wait/i)
  expect(spinner).toBeTruthy()
})

test('does not render when on is false', () => {
  const { container } = render(<Spinner on={false} />)
  expect(container.firstChild).toBeNull()
})

test('spinner has correct id', () => {
  const { container } = render(<Spinner on={true} />)
  const spinner = container.querySelector('#spinner')
  expect(spinner).toBeTruthy()
})
