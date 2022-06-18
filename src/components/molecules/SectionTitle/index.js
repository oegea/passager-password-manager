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
import Title from '../../atoms/Title/index.js';
import Button from '../../atoms/Button/index.js';
import AlertButton from '../../atoms/AlertButton/index.js';

const SectionTitle = styled.div`
    align-items: auto;
    display: flex;
    margin-bottom: 30px;
    gap: 25px;

    @media (max-width: 768px) {
        display: block;
        text-align: center;
    }
`;

const ButtonWrapper = styled.div`
    display: flex;
    gap: 25px;
    @media (max-width: 768px) {
        margin-top: 20px;
        justify-content: center;
    }
`;

const MoleculeSectionTitle = ({title, buttons = []}) => {
    return <SectionTitle>
        <Title>{title}</Title>
        <ButtonWrapper>
            {buttons.map(button => {
                const ButtonComponent = button.type === 'alert' ? AlertButton : Button;
                return <ButtonComponent 
                    key={button.label} 
                    label={button.label} 
                    onClick={button.onClick}/>
            })}
        </ButtonWrapper>


    </SectionTitle>
}

MoleculeSectionTitle.displayName = 'MoleculeSectionTitle';
MoleculeSectionTitle.propTypes = {
    title: PropTypes.string,
    buttons: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string,
        onClick: PropTypes.func,
    })),
};

export default MoleculeSectionTitle;