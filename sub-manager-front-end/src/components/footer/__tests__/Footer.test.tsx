import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer component', () => {
  it('should render the footer with the correct text', () => {
    render(<Footer />);

    expect(screen.getByText(/Made with love/i)).toBeInTheDocument();

    expect(screen.getByText(/by Gabriel Gałęza/i)).toBeInTheDocument();
    
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear, 'i'))).toBeInTheDocument();
  });
});