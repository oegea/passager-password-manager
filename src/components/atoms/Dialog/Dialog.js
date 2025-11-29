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
import React from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
// Atoms
import OverlayBackground from '../OverlayBackground/index.js';
// Constants
import { TOOLBAR_TOP_PADDING } from '../Toolbar/index.js';

const DEFAULT_PADDING = 20;

const scaleIn = keyframes`
    from {
        transform: scale(0.95);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
`;

const scaleOut = keyframes`
    from {
        transform: scale(1);
        opacity: 1;
    }
    to {
        transform: scale(0.95);
        opacity: 0;
    }
`;

const Dialog = styled.div`
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(30px) saturate(120%);
    -webkit-backdrop-filter: blur(30px) saturate(120%);
    border: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12),
                0 0 1px rgba(0, 0, 0, 0.05);
    min-width: 20%;
    max-width: 100%;
    min-height: 150px;
    max-height: 100vh;
    border-radius: 16px;
    padding: ${DEFAULT_PADDING}px;
    animation: ${props => props.$isClosing ? scaleOut : scaleIn} 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;

    @media (max-width: 768px) {
        width: calc(100% - 40px);
        max-width: calc(100% - 40px);
        height: calc(100vh - 40px);
        padding-top: ${DEFAULT_PADDING + TOOLBAR_TOP_PADDING}px;
    }
`;

const AtomDialog = ({ children, onClose }) => {
    const [isClosing, setIsClosing] = React.useState(false);

    const _isDialogBackground = (element) => {
        const isDialogBackground = element.getAttribute(
            'data-isdialogbackground'
        );
        return isDialogBackground === 'true';
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    return (
        <>
            <OverlayBackground
                data-testid="dialog-background"
                data-isdialogbackground="true"
                $isClosing={isClosing}
                onClick={(event) => {
                    if (_isDialogBackground(event.target)) {
                        handleClose();
                    }
                }}
            >
                <Dialog $isClosing={isClosing}>{children}</Dialog>
            </OverlayBackground>
        </>
    );
};

AtomDialog.displayName = 'AtomDialog';
AtomDialog.propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func,
};

export default AtomDialog;
