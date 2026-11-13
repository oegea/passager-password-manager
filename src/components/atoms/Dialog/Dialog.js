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
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
// Atoms
import OverlayBackground from '../OverlayBackground/index.js';

const DEFAULT_PADDING = 24;

const scaleIn = keyframes`
    from {
        transform: translateY(12px) scale(0.96);
        opacity: 0;
    }
    to {
        transform: translateY(0) scale(1);
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
    animation: ${(props) => (props.$isClosing ? scaleOut : scaleIn)}
        var(--duration-base) var(--ease-out) forwards;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    color: var(--color-text);
    max-height: calc(100dvh - 40px);
    max-width: 100%;
    min-width: min(420px, 100%);
    overflow-y: auto;
    padding: ${DEFAULT_PADDING}px;

    @media (max-width: 768px) {
        width: 100%;
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
        }, 220);
    };

    // Rendered in the body: an ancestor with a filter or a transform would
    // otherwise confine a fixed overlay to its own box
    return ReactDOM.createPortal(
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
        </>,
        document.body
    );
};

AtomDialog.displayName = 'AtomDialog';
AtomDialog.propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func,
};

export default AtomDialog;
