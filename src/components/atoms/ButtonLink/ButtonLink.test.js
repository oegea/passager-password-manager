import { render, screen } from '@testing-library/react';
import AtomButtonLink from './index.js';

const DEFAULT_CHILDREN = 'Hello World';

test('renders a basic button link', () => {
  render(<AtomButtonLink><span>{DEFAULT_CHILDREN}</span></AtomButtonLink>);
  const linkElement = screen.getByText(DEFAULT_CHILDREN);
  expect(linkElement).toBeInTheDocument();
});

test('should execute callback when button link is clicked', () => {
  const onClick = jest.fn();
  render(<AtomButtonLink onClick={onClick}><span>{DEFAULT_CHILDREN}</span></AtomButtonLink>);
  const linkElement = screen.getByText(DEFAULT_CHILDREN);
  expect(linkElement).toBeInTheDocument();
  linkElement.click();
  expect(onClick).toHaveBeenCalledTimes(1);
});
