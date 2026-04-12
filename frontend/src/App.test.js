import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the delivery predictor home screen', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1, name: /Quick\s*Deliver/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /predict delivery time/i })).toBeInTheDocument();
});
