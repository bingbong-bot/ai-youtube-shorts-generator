import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders main heading', () => {
    render(<App />);
    const heading = screen.getByText(/AI YouTube Shorts Generator/i);
    expect(heading).toBeInTheDocument();
  });

  test('renders navigation tabs', () => {
    render(<App />);
    expect(screen.getByText(/Create New/i)).toBeInTheDocument();
    expect(screen.getByText(/My Videos/i)).toBeInTheDocument();
  });

  test('renders footer', () => {
    render(<App />);
    const footer = screen.getByText(/All rights reserved/i);
    expect(footer).toBeInTheDocument();
  });
});
