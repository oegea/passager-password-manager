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

import { render, screen } from '@testing-library/react';
import AtomToolbar from './index.js';

const DEFAULT_CONTENT = 'Toolbar content';

test('renders the toolbar with the expected children', () => {
    render(<AtomToolbar>{DEFAULT_CONTENT}</AtomToolbar>);
    const toolbarElement = screen.getByText(DEFAULT_CONTENT);
    expect(toolbarElement).toBeInTheDocument();
});

test('should programmatically apply the marginBottom property', () => {
    render(<AtomToolbar marginBottom="10px">{DEFAULT_CONTENT}</AtomToolbar>);
    const toolbarElement = screen.getByText(DEFAULT_CONTENT);
    expect(toolbarElement).toBeInTheDocument();
    expect(toolbarElement).toHaveStyle('margin-bottom: 10px');
});
