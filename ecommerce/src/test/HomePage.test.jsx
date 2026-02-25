import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import HomePage from '../pages/homepage/home';

// Mock router wrapper
const RouterWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('HomePage', () => {
  it('renders the hero section with main heading', () => {
    render(
      <RouterWrapper>
        <HomePage />
      </RouterWrapper>
    );
    
    expect(screen.getByText('Authentic Chettinadu Masalas')).toBeInTheDocument();
  });

  it('renders the heritage tagline', () => {
    render(
      <RouterWrapper>
        <HomePage />
      </RouterWrapper>
    );
    
    expect(screen.getByText(/Kara-Saaram.*Est. 1965/)).toBeInTheDocument();
  });

  it('renders the Premium Collection section', () => {
    render(
      <RouterWrapper>
        <HomePage />
      </RouterWrapper>
    );
    
    expect(screen.getByText('Premium Collection')).toBeInTheDocument();
  });

  it('renders product cards with navigation links', () => {
    render(
      <RouterWrapper>
        <HomePage />
      </RouterWrapper>
    );
    
    expect(screen.getByText('Sambar Powder')).toBeInTheDocument();
    expect(screen.getByText('Rasam Powder')).toBeInTheDocument();
    expect(screen.getByText('Special Masalas')).toBeInTheDocument();
  });

  it('renders the Heritage Crafted section', () => {
    render(
      <RouterWrapper>
        <HomePage />
      </RouterWrapper>
    );
    
    expect(screen.getByText('Heritage Crafted')).toBeInTheDocument();
    expect(screen.getByText('Stone Ground')).toBeInTheDocument();
    expect(screen.getByText('100% Natural')).toBeInTheDocument();
    expect(screen.getByText('Heritage Recipes')).toBeInTheDocument();
  });

  it('renders the Why Choose Us section', () => {
    render(
      <RouterWrapper>
        <HomePage />
      </RouterWrapper>
    );
    
    expect(screen.getByText('Why Choose Kara-Saaram?')).toBeInTheDocument();
  });

  it('renders the testimonials section', () => {
    render(
      <RouterWrapper>
        <HomePage />
      </RouterWrapper>
    );
    
    expect(screen.getByText('What Our Customers Say')).toBeInTheDocument();
  });

  it('renders the newsletter section', () => {
    render(
      <RouterWrapper>
        <HomePage />
      </RouterWrapper>
    );
    
    expect(screen.getByText('Stay Connected')).toBeInTheDocument();
  });

  it('renders View Details buttons as links', () => {
    render(
      <RouterWrapper>
        <HomePage />
      </RouterWrapper>
    );
    
    const viewDetailsButtons = screen.getAllByText('View Details');
    expect(viewDetailsButtons.length).toBe(3);
  });

  it('renders Shop Premium Collection button', () => {
    render(
      <RouterWrapper>
        <HomePage />
      </RouterWrapper>
    );
    
    expect(screen.getByText('Shop Premium Collection')).toBeInTheDocument();
  });
});
