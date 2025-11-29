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

test('side dialog should NOT close when the background is clicked with text selected', () => {
    const handleClose = jest.fn();

    // Arrange
    render(
        <AtomSideDialog onClose={handleClose}>{DIALOG_CHILDREN}</AtomSideDialog>
    );

    const sideDialogBackground = screen.getByTestId('side-dialog-background');
    expect(sideDialogBackground).toBeInTheDocument();

    // Mock text selection
    const mockSelection = {
        toString: () => 'selected text',
    };
    window.getSelection = jest.fn(() => mockSelection);

    // Act
    fireEvent.click(sideDialogBackground);

    // Assert
    expect(handleClose).not.toHaveBeenCalled();
});

test('side dialog should NOT close when the background is clicked with an input focused', () => {
    const handleClose = jest.fn();

    // Arrange
    render(
        <AtomSideDialog onClose={handleClose}>
            <input data-testid="test-input" type="text" />
        </AtomSideDialog>
    );

    const sideDialogBackground = screen.getByTestId('side-dialog-background');
    const input = screen.getByTestId('test-input');

    // Focus the input
    input.focus();
    expect(document.activeElement).toBe(input);

    // Act
    fireEvent.click(sideDialogBackground);

    // Assert
    expect(handleClose).not.toHaveBeenCalled();
});
