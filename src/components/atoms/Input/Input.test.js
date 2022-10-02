/**
 * This file is part of Passager Password Manager.
 * https://github.com/oegea/passager-password-manager
 *
 * Copyright (C) 2022 Oriol Egea Carvajal
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import AtomInput from './index.js';

const DEFAULT_LABEL = 'My input';

test('renders a styled input', () => {
    render(<AtomInput aria-label={DEFAULT_LABEL} />);
    const inputElement = screen.getByLabelText(DEFAULT_LABEL);
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveStyle('border: 1px solid black;');
});

test('renders with the given value', () => {
    render(
        <AtomInput
            aria-label={DEFAULT_LABEL}
            onChange={() => {}}
            value="Test"
        />
    );
    const inputElement = screen.getByDisplayValue('Test');
    expect(inputElement).toBeInTheDocument();
});

test('should execute onChange when input is changed', () => {
    const onChange = jest.fn();
    render(<AtomInput aria-label={DEFAULT_LABEL} onChange={onChange} />);
    const inputElement = screen.getByLabelText(DEFAULT_LABEL);
    fireEvent.change(inputElement, { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalledTimes(1);
});
