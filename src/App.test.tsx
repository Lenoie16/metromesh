import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders the main layout without crashing', () => {
    // Basic smoke test to ensure the app mounts
    render(<App />);
    
    // Check if the TopBar renders by looking for the MetroMesh title
    expect(screen.getByText('MetroMesh')).toBeInTheDocument();
    
    // Check if the StatusCard renders by looking for Crowd Density
    expect(screen.getByText('Crowd Density')).toBeInTheDocument();
  });
});
