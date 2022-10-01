import { render, screen } from '@testing-library/react';
import InputLabel from '.';

const children = 'Hello!';

const setupTest = () => {
  return render(
    <>
      <InputLabel htmlFor='username'>
        <span>
          {children}
        </span>
      </InputLabel>
      <input id="username" type='text' />
    </>
  );
}
 
describe('<InputLabel />', () => {
  it('should be able to render the label children', () => {
    setupTest()

    const childrenText = screen.getByText(children);

    expect(childrenText).toBeInTheDocument();
  });

  it('should be able to connect the label with the input by htmlFor', () => {
    setupTest()

    const input = screen.getByLabelText(children)
    expect(input.type).toBe('text')
  });
})
 