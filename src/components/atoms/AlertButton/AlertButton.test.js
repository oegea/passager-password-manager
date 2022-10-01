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

import { fireEvent, render, screen } from '@testing-library/react';
import AlertButton from './index.js';

const DEFAULT_LABEL = 'Click Me';

test('renders a button with the given label', () => {
  render(<AlertButton label={DEFAULT_LABEL} />);
  const button = screen.getByText(DEFAULT_LABEL);
  expect(button).toBeInTheDocument();
});

test('renders a red colored button', () => {
  render(<AlertButton label={DEFAULT_LABEL} />);
  const button = screen.getByText(DEFAULT_LABEL);
  expect(button).toHaveStyle('background-color: #d32f2f;');
});

test('should execute callback when button is clicked', () => {
  const onClick = jest.fn();
  render(<AlertButton label={DEFAULT_LABEL} onClick={onClick} />);
  const button = screen.getByText(DEFAULT_LABEL);
  expect(button).toBeInTheDocument();
  fireEvent.click(button);
  expect(onClick).toHaveBeenCalledTimes(1);
});
