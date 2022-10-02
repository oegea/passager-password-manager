import { render, screen } from '@testing-library/react';
import RightPanel from './index.js';

const DEFAULT_CHILDREN = 'Hello World';

test('renders the right panel with children', () => {
  // Arrange
  render(<RightPanel>{DEFAULT_CHILDREN}</RightPanel>);

  // Act
  const childElement = screen.getByText(DEFAULT_CHILDREN);

  // Assert
  expect(childElement).toBeInTheDocument();
});
