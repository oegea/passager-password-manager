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

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import { mdiAlertCircleOutline, mdiCheck } from '@mdi/js';
import Icon from '../../atoms/Icon/index.js';

const slideIn = keyframes`
    from {
        transform: translate(-50%, -24px);
        opacity: 0;
    }
    to {
        transform: translate(-50%, 0);
        opacity: 1;
    }
`;

const slideOut = keyframes`
    from {
        transform: translate(-50%, 0);
        opacity: 1;
    }
    to {
        transform: translate(-50%, -24px);
        opacity: 0;
    }
`;

const ToastContainer = styled.div`
    align-items: center;
    animation: ${(props) => (props.$isVisible ? slideIn : slideOut)}
        var(--duration-base) var(--ease-out) forwards;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    box-shadow: var(--shadow-lg);
    color: var(--color-text);
    display: flex;
    font-size: 14px;
    font-weight: 600;
    gap: 8px;
    left: 50%;
    max-width: calc(100vw - 32px);
    padding: 10px 18px 10px 12px;
    position: fixed;
    top: 16px;
    z-index: 10000;

    & svg {
        background: var(--color-success-soft);
        border-radius: 50%;
        color: var(--color-success);
        padding: 3px;
    }

    &[data-kind='error'] svg {
        background: var(--color-danger-soft);
        color: var(--color-danger);
    }
`;

const Toast = ({ message, duration = 3000, onClose, kind = 'success' }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
                onClose();
            }, 300); // Wait for animation to complete
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return ReactDOM.createPortal(
        <ToastContainer $isVisible={isVisible} data-kind={kind} role="status">
            <Icon
                path={kind === 'error' ? mdiAlertCircleOutline : mdiCheck}
                size={0.8}
            />
            {message}
        </ToastContainer>,
        document.body
    );
};

Toast.displayName = 'Toast';
Toast.propTypes = {
    message: PropTypes.string.isRequired,
    duration: PropTypes.number,
    kind: PropTypes.oneOf(['success', 'error']),
    onClose: PropTypes.func.isRequired,
};

export default Toast;