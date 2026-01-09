import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { LoadingProvider, useLoading } from './LoadingContext';

const TestComponent = () => {
  const { isLoading, showLoader, hideLoader } = useLoading();
  return (
    <div>
      <span data-testid="status">{isLoading ? 'LOADING' : 'IDLE'}</span>
      <button onClick={() => showLoader(true)}>Start</button>
      <button onClick={hideLoader}>Stop</button>
    </div>
  );
};

test('LoadingContext toggles status correctly', () => {
  render(
    <LoadingProvider>
      <TestComponent />
    </LoadingProvider>
  );

  expect(screen.getByTestId('status')).toHaveTextContent('IDLE');
  
  // Trigger loading
  act(() => {
    screen.getByText('Start').click();
  });
  expect(screen.getByTestId('status')).toHaveTextContent('LOADING');

  // Trigger stop
  act(() => {
    screen.getByText('Stop').click();
  });
  expect(screen.getByTestId('status')).toHaveTextContent('IDLE');
});