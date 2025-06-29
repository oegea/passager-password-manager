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

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PasswordActionsDropdown from './index.js';

// Mock mobile lib
jest.mock('../../../libs/mobile.js', () => ({
    writeClipboard: jest.fn(),
    isMobileDevice: jest.fn(() => false),
}));

// Mock translations
jest.mock('../../../hooks/useTranslation/index.js', () => {
    return () => ({
        t: (key) => key,
    });
});

describe('PasswordActionsDropdown', () => {
    const mockOnGenerate = jest.fn();

    beforeEach(() => {
        mockOnGenerate.mockClear();
    });

    test('renders dropdown trigger', () => {
        render(<PasswordActionsDropdown value="test" onGenerate={mockOnGenerate} />);
        expect(screen.getByTestId('password-actions-dropdown')).toBeInTheDocument();
    });

    test('opens dropdown when clicked', () => {
        render(<PasswordActionsDropdown value="test" onGenerate={mockOnGenerate} />);
        
        const triggerButton = screen.getByTestId('password-actions-dropdown').querySelector('div');
        fireEvent.click(triggerButton);
        
        expect(screen.getByText('common.Copy')).toBeInTheDocument();
        expect(screen.getByText('passwordGenerator.Generate')).toBeInTheDocument();
    });

    test('opens generator when generate option is clicked', () => {
        render(<PasswordActionsDropdown value="test" onGenerate={mockOnGenerate} />);
        
        // Open dropdown
        const triggerButton = screen.getByTestId('password-actions-dropdown').querySelector('div');
        fireEvent.click(triggerButton);
        
        // Click generate
        fireEvent.click(screen.getByText('passwordGenerator.Generate'));
        
        expect(screen.getByText('passwordGenerator.Password Generator')).toBeInTheDocument();
    });
});