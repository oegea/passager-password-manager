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
import {
    DEFAULT_TOOLBAR_HEIGHT,
    TOOLBAR_TOP_PADDING,
} from '../Toolbar/index.js';

// 110px = 60px from header + 25px*2 (top and bottom) from padding
const RightPanel = styled.div`
    background: white;
    height: calc(
        100vh - ${50 + DEFAULT_TOOLBAR_HEIGHT + TOOLBAR_TOP_PADDING}px
    );
    padding: 25px;
    overflow-y: auto;
    overflow-x: visible;
    width: calc(100% - 25px);
`;

const AtomRightPanel = ({ children }) => {
    return (
        <RightPanel data-testid="right-panel-element">{children}</RightPanel>
    );
};

AtomRightPanel.displayName = 'AtomLeftPanel';
AtomRightPanel.propTypes = {
    children: PropTypes.node,
};

export default AtomRightPanel;
