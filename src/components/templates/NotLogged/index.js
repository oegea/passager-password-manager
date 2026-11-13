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
import styled from 'styled-components';
import PropTypes from 'prop-types';
// Atoms
import ThemeToggle from '../../atoms/ThemeToggle/index.js';

const Wrapper = styled.div`
    align-items: center;
    background: var(--color-bg-gradient), var(--color-bg);
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 100dvh;
    padding: 72px 16px 96px;
`;

const Corner = styled.div`
    position: fixed;
    right: 16px;
    top: 14px;
`;

const Brand = styled.div`
    align-items: center;
    animation: passager-fade-up var(--duration-slow) var(--ease-out) both;
    display: flex;
    font-size: 20px;
    font-weight: 700;
    gap: 10px;
    letter-spacing: -0.02em;
    margin-bottom: 22px;

    & img {
        height: 34px;
        width: 34px;
    }
`;

const Content = styled.div`
    animation: passager-fade-up var(--duration-slow) var(--ease-out) 60ms both;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    max-width: 560px;
    padding: 32px;
    width: 100%;

    & > div:first-child {
        margin-bottom: 12px;
    }

    & p {
        color: var(--color-text-muted);
    }

    & > button {
        margin-top: 14px;
    }

    @media (max-width: 768px) {
        padding: 24px 20px;
    }
`;

const TemplateNotLogged = ({ children }) => {
    return (
        <Wrapper>
            <Corner>
                <ThemeToggle />
            </Corner>
            <Brand aria-hidden="true">
                <img src="/logo192.png" alt="" />
                Passager
            </Brand>
            <Content>{children}</Content>
        </Wrapper>
    );
};

TemplateNotLogged.displayName = 'TemplateNotLogged';
TemplateNotLogged.propTypes = {
    children: PropTypes.node,
};

export default TemplateNotLogged;
