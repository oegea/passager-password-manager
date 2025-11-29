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
// Constants
import { TOOLBAR_TOP_PADDING } from '../Toolbar/index.js';

const fadeIn = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const fadeOut = keyframes`
    from {
        opacity: 1;
    }
    to {
        opacity: 0;
    }
`;

const slideIn = keyframes`
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
`;

const slideOut = keyframes`
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
`;

const DialogBackground = styled.div`
    width: 100%;
    background: rgba(1,1,1,0.28);
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    animation: ${props => props.$isClosing ? fadeOut : fadeIn} 0.25s ease-out forwards;
`;

const DEFAULT_PADDING = 25;

const SideDialog = styled.div`
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(30px) saturate(120%);
    -webkit-backdrop-filter: blur(30px) saturate(120%);
    border-radius: 16px 0 0 16px;
    border-left: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.08),
                0 0 1px rgba(0, 0, 0, 0.05);
    max-height: 100vh;
    max-width: 400px;
    min-height: 100vh;
    overflow: hidden;
    padding: ${DEFAULT_PADDING}px;
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    animation: ${props => props.$isClosing ? slideOut : slideIn} 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;

    @media (max-width: 768px) {
        width: calc(100% - 50px);
        max-width: calc(100% - 50px);
        padding-top: ${DEFAULT_PADDING + TOOLBAR_TOP_PADDING}px;
        border-radius: 16px 0 0 0;
    }
`;

const SideDialogContext = React.createContext(null);

export const useSideDialogClose = () => {
    const context = React.useContext(SideDialogContext);
    if (!context) {
        throw new Error('useSideDialogClose must be used within a SideDialog');
    }
    return context.handleClose;
};

const AtomSideDialog = ({ children, onClose }) => {
    const [isClosing, setIsClosing] = React.useState(false);
    const closeRequestedRef = React.useRef(false);

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

    const handleClose = React.useCallback(() => {
        if (closeRequestedRef.current) return;

        closeRequestedRef.current = true;
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 350);
    }, [onClose]);

    return (
        <SideDialogContext.Provider value={{ handleClose }}>
            <DialogBackground
                data-testid="side-dialog-background"
                data-isdialogbackground="true"
                $isClosing={isClosing}
                onClick={(event) => {
                    if (_isDialogBackground(event.target) && !_hasTextSelection() && !_hasInputFocused()) {
                        handleClose();
                    }
                }}
            >
                <SideDialog $isClosing={isClosing}>{children}</SideDialog>
            </DialogBackground>
        </SideDialogContext.Provider>
    );
};

AtomSideDialog.displayName = 'AtomSideDialog';
AtomSideDialog.propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func,
};

export default AtomSideDialog;
('');
