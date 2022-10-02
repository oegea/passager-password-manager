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

import { render, screen, act } from '@testing-library/react';
import LanguageSelector from './index.js';
import i18n from 'i18next';
import { i18nConfig } from '../../../config/i18n.js';
import { initReactI18next } from 'react-i18next';

beforeAll(() => {
    i18n.use(initReactI18next).init(i18nConfig);
});

test('Checks that the main languages are present', () => {
    render(<LanguageSelector />);
    const linkElementEspaniol = screen.getByText('Español');
    const linkElementIngles = screen.getByText('English');
    expect(linkElementEspaniol).toBeInTheDocument();
    expect(linkElementIngles).toBeInTheDocument();
});

test('It should change from one language to other', async () => {
    render(<LanguageSelector />);
    const textExample = screen.getByText('Switch to:');
    expect(textExample).toBeInTheDocument();
    const linkElementEspaniol = screen.getByText('Español');
    act(() => {
        linkElementEspaniol.click();
    });
    expect(await screen.findByText('Cambiar a:')).toBeInTheDocument();
});
