import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AtomDialog from './Dialog.js';

const DIALOG_CHILDREN = 'Hello World';

test('renders a dialog with children', () => {
  render(<AtomDialog>{DIALOG_CHILDREN}</AtomDialog>);

  const childElement = screen.getByText(DIALOG_CHILDREN);

  expect(childElement).toBeInTheDocument();
});

test('dialog should close when the background is clicked (with animation delay)', async () => {
  const handleClose = jest.fn();

  render(
    <AtomDialog onClose={handleClose}>
      {DIALOG_CHILDREN}
    </AtomDialog>
  );

  const dialogBackground = screen.getByTestId('dialog-background');
  expect(dialogBackground).toBeInTheDocument();

  fireEvent.click(dialogBackground);

  // Esperamos a que se ejecute el onClose tras la animación (~300ms)
  await waitFor(() => {
    expect(handleClose).toHaveBeenCalledTimes(1);
  }, { timeout: 500 });
});
