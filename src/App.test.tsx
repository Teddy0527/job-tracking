import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app without crashing', () => {
  render(<App />);
  // Just verify the app renders without crashing
  // More specific tests should be in component-specific test files
});
