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

// Third party dependencies
import styled from 'styled-components';

const LicenseNoticeDiv = styled.div`
    bottom: 14px;
    color: var(--color-text-faint);
    font-size: 12px;
    left: 0;
    line-height: 1.7;
    padding: 0 16px;
    position: fixed;
    text-align: center;
    width: 100%;

    & a {
        color: var(--color-text-muted);
    }
`;

const LicenseNotice = () => {
    return <LicenseNoticeDiv>
        <span> Made with ❤️ from Barcelona. <a href="https://github.com/oegea/passager-password-manager/" target="_blank" rel="noreferrer">Passager is Open Source. Released under AGPLv3.</a></span> <br /> <a href="https://www.passager.app/#%EF%B8%8F-important-notice-for-users-in-spain" target="_blank" rel="noreferrer">Pulsa aquí estás experimentando problemas para acceder desde España.</a>
    </LicenseNoticeDiv>;
};

LicenseNotice.displayName = 'LicenseNotice';

export default LicenseNotice;
