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
import PropTypes from 'prop-types';
import styled from 'styled-components';
// Constants
import { DEFAULT_TOOLBAR_HEIGHT } from '../Toolbar/index.js';

const RightPanel = styled.div`
    animation: passager-fade-in var(--duration-base) ease-out;
    flex: 1;
    height: calc(100dvh - ${DEFAULT_TOOLBAR_HEIGHT}px);
    min-width: 0;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 32px clamp(16px, 4vw, 48px) 48px;
`;

const Content = styled.div`
    margin: 0 auto;
    max-width: 1040px;
`;

const AtomRightPanel = ({ children }) => {
    return (
        <RightPanel data-testid="right-panel-element">
            <Content>{children}</Content>
        </RightPanel>
    );
};

AtomRightPanel.displayName = 'AtomLeftPanel';
AtomRightPanel.propTypes = {
    children: PropTypes.node,
};

export default AtomRightPanel;
