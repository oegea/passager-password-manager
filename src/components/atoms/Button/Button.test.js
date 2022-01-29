import { render, screen } from '@testing-library/react';
import AtomButton from './index.js';

const DEFAULT_LABEL = 'Hello World';

test('renders a basic button', () => {
  render(<AtomButton label={DEFAULT_LABEL}/>);
  const linkElement = screen.getByText(DEFAULT_LABEL);
  expect(linkElement).toBeInTheDocument();
});

test('should execute callback when button is clicked', () => {
  const onClick = jest.fn();
  render(<AtomButton label={DEFAULT_LABEL} onClick={onClick}/>);
  const linkElement = screen.getByText(DEFAULT_LABEL);
  expect(linkElement).toBeInTheDocument();
  linkElement.click();
  expect(onClick).toHaveBeenCalledTimes(1);
});
