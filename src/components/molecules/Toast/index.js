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
import { mdiCheck } from '@mdi/js';
import Icon from '@mdi/react';

const slideIn = keyframes`
    from {
        transform: translateY(-100px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
`;

const slideOut = keyframes`
    from {
        transform: translateY(0);
        opacity: 1;
    }
    to {
        transform: translateY(-100px);
        opacity: 0;
    }
`;

const ToastContainer = styled.div`
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4caf50;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 10000;
    animation: ${props => props.isVisible ? slideIn : slideOut} 0.3s ease-out forwards;
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
`;

const Toast = ({ message, duration = 3000, onClose }) => {
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
        <ToastContainer isVisible={isVisible}>
            <Icon path={mdiCheck} size={0.8} />
            {message}
        </ToastContainer>,
        document.body
    );
};

Toast.displayName = 'Toast';
Toast.propTypes = {
    message: PropTypes.string.isRequired,
    duration: PropTypes.number,
    onClose: PropTypes.func.isRequired,
};

export default Toast;