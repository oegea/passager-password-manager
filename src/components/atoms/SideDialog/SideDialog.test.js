import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AtomSideDialog from '.';

const DIALOG_CHILDREN = 'Hello World';

// ----------------------------
// Render básico
// ----------------------------
test('renders a side dialog with children', () => {
  render(<AtomSideDialog>{DIALOG_CHILDREN}</AtomSideDialog>);

  const childElement = screen.getByText(DIALOG_CHILDREN);

  expect(childElement).toBeInTheDocument();
});

// ----------------------------
// Cierre normal con animación (ASYNC)
// ----------------------------
test('side dialog should close when the background is clicked', async () => {
  const handleClose = jest.fn();

  render(
    <AtomSideDialog onClose={handleClose}>
      {DIALOG_CHILDREN}
    </AtomSideDialog>
  );

  const sideDialogBackground = screen.getByTestId('side-dialog-background');
  expect(sideDialogBackground).toBeInTheDocument();

  fireEvent.click(sideDialogBackground);

  await waitFor(() => {
    expect(handleClose).toHaveBeenCalledTimes(1);
  }, { timeout: 500 }); // >300ms de la animación
});

// ----------------------------
// NO cerrar si hay texto seleccionado
// ----------------------------
test('side dialog should NOT close when the background is clicked with text selected', async () => {
  const handleClose = jest.fn();

  render(
    <AtomSideDialog onClose={handleClose}>
      {DIALOG_CHILDREN}
    </AtomSideDialog>
  );

  const sideDialogBackground = screen.getByTestId('side-dialog-background');
  expect(sideDialogBackground).toBeInTheDocument();

  const mockSelection = {
    toString: () => 'selected text',
  };

  jest
    .spyOn(window, 'getSelection')
    // por si TS se queja
    .mockReturnValue(mockSelection);

  fireEvent.click(sideDialogBackground);

  // Esperamos un poco por si hay timeout interno, pero verificamos que NO se llame
  await waitFor(() => {
    expect(handleClose).not.toHaveBeenCalled();
  }, { timeout: 500 });
});

// ----------------------------
// NO cerrar si hay un input enfocado
// ----------------------------
test('side dialog should NOT close when the background is clicked with an input focused', async () => {
  const handleClose = jest.fn();

  render(
    <AtomSideDialog onClose={handleClose}>
      <input data-testid="test-input" type="text" />
    </AtomSideDialog>
  );

  const sideDialogBackground = screen.getByTestId('side-dialog-background');
  const input = screen.getByTestId('test-input');

  input.focus();
  expect(document.activeElement).toBe(input);

  fireEvent.click(sideDialogBackground);

  await waitFor(() => {
    expect(handleClose).not.toHaveBeenCalled();
  }, { timeout: 500 });
});
