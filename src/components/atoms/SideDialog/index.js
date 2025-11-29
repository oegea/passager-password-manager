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
import { TOOLBAR_TOP_PADDING } from '../Toolbar/index.js';

const DialogBackground = styled.div`
    width: 100%;
    background: rgba(1,1,1,0.28);
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
`;

const DEFAULT_PADDING = 25;

const SideDialog = styled.div`
    background: white;
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    max-height: 100vh;
    max-width: 400px;
    min-height: 100vh;
    overflow: hidden;
    padding: ${DEFAULT_PADDING}px;
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;

    @media (max-width: 768px) {
        width: calc(100% - 50px);
        max-width: calc(100% - 50px);
        padding-top: ${DEFAULT_PADDING + TOOLBAR_TOP_PADDING}px;
    }
`;

const AtomSideDialog = ({ children, onClose }) => {
    const _isDialogBackground = (element) => {
        const isDialogBackground = element.getAttribute(
            'data-isdialogbackground'
        );
        return isDialogBackground === 'true';
    };

    const _hasTextSelection = () => {
        const selection = window.getSelection();
        return selection && selection.toString().length > 0;
    };

    const _hasInputFocused = () => {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA'
        );
    };

    return (
        <>
            <DialogBackground
                data-testid="side-dialog-background"
                data-isdialogbackground="true"
                onClick={(event) => {
                    if (_isDialogBackground(event.target) && !_hasTextSelection() && !_hasInputFocused()) {
                        onClose();
                    }
                }}
            >
                <SideDialog>{children}</SideDialog>
            </DialogBackground>
        </>
    );
};

AtomSideDialog.displayName = 'AtomSideDialog';
AtomSideDialog.propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func,
};

export default AtomSideDialog;
('');
