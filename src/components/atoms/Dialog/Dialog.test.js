import { render, screen, fireEvent } from '@testing-library/react';
import AtomDialog from './Dialog.js';

const DIALOG_CHILDREN = 'Hello World';

test('renders a dialog with children', () => {
    // Arrange
    render(<AtomDialog>{DIALOG_CHILDREN}</AtomDialog>);

    // Act
    const childElement = screen.getByText(DIALOG_CHILDREN);

    // Assert
    expect(childElement).toBeInTheDocument();
});

test('dialog should close when the background is clicked', () => {
    const handleClose = jest.fn();

    // Arrange
    render(<AtomDialog onClose={handleClose}>{DIALOG_CHILDREN}</AtomDialog>);

    const dialogBackground = screen.getByTestId('dialog-background');
    expect(dialogBackground).toBeInTheDocument();

    // Act
    fireEvent.click(dialogBackground);

    // Assert
    expect(handleClose).toHaveBeenCalledTimes(1);
});
