import { render, screen, fireEvent } from '@testing-library/react';
import AtomSideDialog from '.';

const DIALOG_CHILDREN = 'Hello World';

test('renders a side dialog with children', () => {
	// Arrange
	render(<AtomSideDialog>{DIALOG_CHILDREN}</AtomSideDialog>);

	// Act
	const childElement = screen.getByText(DIALOG_CHILDREN);

	// Assert
	expect(childElement).toBeInTheDocument();
});

test('side dialog should close when the background is clicked', () => {
	const handleClose = jest.fn();

	// Arrange
	render(
		<AtomSideDialog onClose={handleClose}>{DIALOG_CHILDREN}</AtomSideDialog>
	);

	const sideDialogBackground = screen.getByTestId('side-dialog-background');
	expect(sideDialogBackground).toBeInTheDocument();

	// Act
	fireEvent.click(sideDialogBackground);

	// Assert
	expect(handleClose).toHaveBeenCalledTimes(1);
});
