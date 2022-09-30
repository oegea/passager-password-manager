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
 import LeftPanel from './index.js';
 
 const DEFAULT_CHILDREN = 'Hello World';
 
 test('renders the left panel', () => {
   render(<LeftPanel><span>{DEFAULT_CHILDREN}</span></LeftPanel>);
   const linkElement = screen.getByText(DEFAULT_CHILDREN);
   expect(linkElement).toBeInTheDocument();
 });
 
 test('It should have a display with the correct resolution', () => {
    render(<LeftPanel><span>{DEFAULT_CHILDREN}</span></LeftPanel>);
    const element = screen.getByTestId('left-panel-element');
    expect(element).toBeInTheDocument();
    expect(element).toHaveStyle('display: block');
 });
 