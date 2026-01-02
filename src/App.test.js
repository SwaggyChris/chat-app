import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('renders login page by default', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
  });
});
