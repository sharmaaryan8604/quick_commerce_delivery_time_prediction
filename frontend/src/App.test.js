import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('renders the delivery predictor home screen', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1, name: /Quick\s*Deliver/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /predict delivery time/i })).toBeInTheDocument();
});

test('keeps edited rating values after showing a prediction', async () => {
  const originalFetch = global.fetch;

  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      predicted_minutes: 43,
      lower_bound: 38,
      upper_bound: 48,
      confidence: 91,
    }),
  });

  render(<App />);

  await userEvent.type(screen.getByLabelText(/order value/i), '702');
  await userEvent.type(screen.getByLabelText(/item count/i), '12');
  await userEvent.selectOptions(screen.getByLabelText(/payment method/i), 'Wallet');
  await userEvent.selectOptions(screen.getByLabelText(/^company/i), 'Swiggy Instamart');
  await userEvent.selectOptions(screen.getByLabelText(/city/i), 'Delhi');
  await userEvent.selectOptions(screen.getByLabelText(/product category/i), 'Dairy');
  await userEvent.type(screen.getByLabelText(/distance/i), '6.9');

  const customerRating = screen.getByLabelText(/customer rating/i);
  await userEvent.clear(customerRating);
  await userEvent.type(customerRating, '5');

  await userEvent.click(screen.getByRole('button', { name: /predict delivery time/i }));
  expect(await screen.findByText(/estimated delivery time/i)).toBeInTheDocument();

  await userEvent.clear(screen.getByLabelText(/customer rating/i));
  await userEvent.type(screen.getByLabelText(/customer rating/i), '2');

  expect(screen.getByLabelText(/customer rating/i)).toHaveValue('2');
  expect(screen.queryByText(/estimated delivery time/i)).not.toBeInTheDocument();

  global.fetch = originalFetch;
});
