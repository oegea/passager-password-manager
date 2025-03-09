/**
 * This file is part of Passager Password Manager.
 * https://github.com/oegea/passager-password-manager
 *
 * Copyright (C) 2022-2025 Oriol Egea Carvajal
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
    left: 10px;
    background: white !important;
    width: calc(100% - 60px);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    position: fixed;
    bottom: 10px;
    flex-direction: column;
    padding: 20px;
    font-weight: 500;
    font-size: x-small;
`;

const LicenseNotice = () => {
    return <LicenseNoticeDiv>
        <span> Made with ❤️ from Barcelona. <a href="https://github.com/oegea/passager-password-manager/" target="_blank" rel="noreferrer">Passager is Open Source. Released under AGPLv3.</a></span> <br /> <a href="https://www.passager.app/#%EF%B8%8F-important-notice-for-users-in-spain" target="_blank" rel="noreferrer">Pulsa aquí estás experimentando problemas para acceder desde España.</a>
    </LicenseNoticeDiv>;
};

LicenseNotice.displayName = 'LicenseNotice';

export default LicenseNotice;
