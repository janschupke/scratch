
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('bg-vscode-sidebar');
  });

  it('renders with label', () => {
    render(<Input label="Test Label" />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('renders with helper text', () => {
    render(<Input helperText="This is helper text" />);
    
    expect(screen.getByText('This is helper text')).toBeInTheDocument();
    expect(screen.getByText('This is helper text')).toHaveClass('text-vscode-muted');
  });

  it('renders with error message', () => {
    render(<Input error="This is an error" />);
    
    expect(screen.getByText('This is an error')).toBeInTheDocument();
    expect(screen.getByText('This is an error')).toHaveClass('text-semantic-error');
  });

  it('applies error styling when error is present', () => {
    render(<Input error="Error message" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-semantic-error');
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    
    expect(ref).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('generates unique id when not provided', () => {
    render(<Input label="Test" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id');
    expect(input.getAttribute('id')).toMatch(/^input-/);
  });

  it('uses provided id when available', () => {
    render(<Input id="custom-id" label="Test" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'custom-id');
  });

  it('associates label with input correctly', () => {
    render(<Input id="test-input" label="Test Label" />);
    
    const label = screen.getByText('Test Label');
    const input = screen.getByRole('textbox');
    
    expect(label).toHaveAttribute('for', 'test-input');
    expect(input).toHaveAttribute('id', 'test-input');
  });

  it('supports placeholder text', () => {
    render(<Input placeholder="Enter text here" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter text here');
  });

  it('supports disabled state', () => {
    render(<Input disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50');
  });

  it('supports required attribute', () => {
    render(<Input required />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('required');
  });

  it('supports different input types', () => {
    render(<Input type="email" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });
}); 
