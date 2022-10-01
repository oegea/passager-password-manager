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
// Atoms
import Button from '../../atoms/Button/index.js';
import ButtonWrapper from '../../atoms/Dialog/DialogButtonWrapper.js';
import Description from '../../atoms/Description/index.js';
import Dialog from '../../atoms/Dialog/Dialog.js';
import Title from '../../atoms/Title/index.js';
// Hooks
import useDialogConfirmation from '../../../hooks/useDialogConfirmation/index.js';
import useTranslation from '../../../hooks/useTranslation/index.js';

const ConfirmationDialog = ({onAccept, closeDialog, description = ''}) => {
    const {t} = useTranslation();
    useDialogConfirmation(closeDialog, onAccept);

    return (
        <Dialog onClose={() => closeDialog()}>
            <Title marginBottom='25px'>{t('confirmationDialog.Are you sure you want to proceed?')}</Title>
            {description && (
                <Description>{description}</Description>
            )}
            <ButtonWrapper>
                <Button label={t('common.Cancel')} onClick={() => closeDialog()} color="black" backgroundColor="white"/>
                <Button label={t('common.Continue')} onClick={() => onAccept()} color="black" backgroundColor="white"/>
            </ButtonWrapper>
        </Dialog>
    );
}

ConfirmationDialog.displayName = 'ConfirmationDialog';
ConfirmationDialog.propTypes = {
    onAccept: PropTypes.func,
    closeDialog: PropTypes.func,
    description: PropTypes.string
}

export default ConfirmationDialog;