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
import Icon from '@mdi/react';

const Button = styled.div`
    background-color: transparent;
    border-radius: 10px;
    color: white;
    cursor: pointer;
    padding: 7px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;

    &:hover {
        border: 2px solid white;
        padding: 5px;
    }

    @media (max-width: 768px) {
        padding: 5px;

        &:hover {
            padding: 3px;
        }
    }
`;

const ButtonLabel = styled.span`
    @media (max-width: 768px) {
        display: none;
    }
`;

const ButtonIcon = styled(Icon)`
    @media (min-width: 769px) {
        display: none;
    }
`;

const AtomToolbarButton = ({ label, onClick, icon }) => {
    return (
        <Button onClick={onClick}>
            {icon && <ButtonIcon path={icon} size={0.9} />}
            <ButtonLabel>{label}</ButtonLabel>
        </Button>
    );
};

AtomToolbarButton.displayName = 'AtomToolbarButton';
AtomToolbarButton.propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func,
    icon: PropTypes.string,
};

export default AtomToolbarButton;
