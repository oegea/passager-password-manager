import { render, screen, fireEvent } from '@testing-library/react';
import AtomDescription from '.';

const DESCRIPTION_CHILDREN = 'Hello World';

test('renders description with children', () => {
	// Arrange
	render(<AtomDescription>{DESCRIPTION_CHILDREN}</AtomDescription>);

	// Act
	const childElement = screen.getByText(DESCRIPTION_CHILDREN);

	// Assert
	expect(childElement).toBeInTheDocument();
});
