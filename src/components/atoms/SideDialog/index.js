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
    animation: ${(props) => (props.$isClosing ? fadeOut : fadeIn)}
        var(--duration-base) ease-out forwards;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    background: var(--color-overlay);
    inset: 0;
    position: fixed;
    z-index: 900;
`;

const DEFAULT_PADDING = 28;

const SideDialog = styled.div`
    animation: ${(props) => (props.$isClosing ? slideOut : slideIn)}
        var(--duration-slow) var(--ease-out) forwards;
    background: var(--color-surface-raised);
    border-left: 1px solid var(--color-border);
    border-radius: var(--radius-xl) 0 0 var(--radius-xl);
    box-shadow: var(--shadow-lg);
    color: var(--color-text);
    height: 100dvh;
    max-width: 100%;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: ${DEFAULT_PADDING}px;
    position: fixed;
    right: 0;
    top: 0;
    width: 460px;

    @media (max-width: 768px) {
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        padding: 22px 18px 28px;
        width: 100%;
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
        }, 300);
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
