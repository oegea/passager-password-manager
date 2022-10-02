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
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Button from '../../atoms/Button/index.js';

const ButtonCopy = styled.div`
    padding-left: 0.7rem;
`;

const MoleculesButtonCopy = ({ value }) => {
    const { t } = useTranslation();

    const copyHandler = () => {
        navigator.clipboard.writeText(value);
    };

    return (
        <ButtonCopy data-testid="button-copy-element">
            <Button
                label={t('common.Copy')}
                onClick={copyHandler}
                color="black"
                backgroundColor="white"
            />
        </ButtonCopy>
    );
};

MoleculesButtonCopy.displayName = 'MoleculesButtonCopy';
MoleculesButtonCopy.propTypes = {
    value: PropTypes.string,
};

export default MoleculesButtonCopy;
