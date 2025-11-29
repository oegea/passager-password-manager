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
import styled, { keyframes } from 'styled-components';

const indeterminateAnimation = keyframes`
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(400%);
    }
`;

const ProgressContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background-color: rgba(0, 0, 0, 0.05);
    z-index: 1000;
    overflow: hidden;
`;

const ProgressBar = styled.div`
    height: 100%;
    width: 25%;
    background: linear-gradient(90deg,
        rgba(255, 255, 255, 0.3),
        rgba(255, 255, 255, 0.8),
        rgba(255, 255, 255, 0.3)
    );
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
    animation: ${indeterminateAnimation} 1.5s ease-in-out infinite;
    transform-origin: left;
`;

const AtomLinearProgress = () => {
    return (
        <ProgressContainer>
            <ProgressBar />
        </ProgressContainer>
    );
};

AtomLinearProgress.displayName = 'AtomLinearProgress';

export default AtomLinearProgress;
