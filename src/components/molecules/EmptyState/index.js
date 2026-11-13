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
// Atoms
import Button from '../../atoms/Button/index.js';
import Icon from '../../atoms/Icon/index.js';

const Wrapper = styled.div`
    align-items: center;
    animation: passager-fade-up var(--duration-slow) var(--ease-out) both;
    color: var(--color-text-muted);
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 72px 20px;
    text-align: center;
`;

const IconCircle = styled.div`
    align-items: center;
    background: var(--color-accent-soft);
    border-radius: 24px;
    color: var(--color-accent);
    display: flex;
    height: 72px;
    justify-content: center;
    width: 72px;
`;

const Heading = styled.h1`
    color: var(--color-text);
    font-size: 22px;
    margin: 0;
`;

const Description = styled.p`
    margin: 0;
    max-width: 420px;
`;

/** Friendly placeholder for a screen that has nothing to show yet. */
const MoleculeEmptyState = ({ icon, title, description, action }) => {
    return (
        <Wrapper>
            <IconCircle>
                <Icon path={icon} size={1.4} />
            </IconCircle>
            <Heading>{title}</Heading>
            {description && <Description>{description}</Description>}
            {action && (
                <Button
                    label={action.label}
                    onClick={action.onClick}
                    icon={action.icon}
                    variant="primary"
                />
            )}
        </Wrapper>
    );
};

MoleculeEmptyState.displayName = 'MoleculeEmptyState';
MoleculeEmptyState.propTypes = {
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    action: PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
        icon: PropTypes.string,
    }),
};

export default MoleculeEmptyState;
