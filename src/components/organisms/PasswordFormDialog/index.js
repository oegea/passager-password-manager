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
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import useTranslation from '../../../hooks/useTranslation/index.js';
// Atoms
import SideDialog, { useSideDialogClose } from '../../atoms/SideDialog/index.js';
import Button from '../../atoms/Button/index.js';
import ButtonWrapper from '../../atoms/Dialog/DialogButtonWrapper.js';
import FieldError from '../../atoms/FieldError/index.js';
import Input from '../../atoms/Input/index.js';
import InputWrapper from '../../atoms/Dialog/DialogInputWrapper.js';
import InputLabel from '../../atoms/InputLabel/index.js';
import TextArea from '../../atoms/TextArea/index.js';
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
import PasswordActionsDropdown from '../../molecules/PasswordActionsDropdown/index.js';
import MoleculesButtonCopy from '../../molecules/CopyButton/index.js';
import ItemTypeSelector from '../../molecules/ItemTypeSelector/index.js';
import FileField from '../../molecules/FileField/index.js';
// Hooks
import useDialogConfirmation from '../../../hooks/useDialogConfirmation/index.js';
// Own libs
import { isBackendMode } from '../../../libs/backend.js';
import {
    createEmptyItem,
    downloadFile,
    formatBytes,
    fromStoredFields,
    ITEM_FIELDS,
    ITEM_TYPE_FILE,
    ITEM_TYPE_PASSWORD,
    ITEM_TYPES,
    ItemTooLargeError,
    MAX_CONTENT_BYTES,
    toStoredFields,
} from '../../../libs/items.js';

const DEFAULT_VALUES = {
    name: '',
    url: '',
    username: '',
    password: '',
};

// Single line fields keep the limit they always had
const MAX_FIELD_LENGTH = 150;
// Backends reject longer names
const MAX_BACKEND_NAME_LENGTH = 50;

const FieldRow = styled.div`
    align-items: flex-start;
    display: flex;
`;

const Fields = styled.div`
    animation: passager-fade-up var(--duration-base) var(--ease-out);
`;

const Optional = styled.span`
    color: var(--color-text-faint);
    font-weight: 500;
    margin-left: 6px;
`;

const FormError = styled.p`
    background: var(--color-danger-soft);
    border-radius: var(--radius-md);
    color: var(--color-danger);
    font-size: 14px;
    font-weight: 500;
    margin: 0;
    padding: 10px 12px;
`;

/** Ids the password fields always had. Other types get a prefix. */
const getFieldId = (type, fieldId) =>
    type === ITEM_TYPE_PASSWORD ? fieldId : `${type}-${fieldId}`;

const PasswordFormDialogContent = ({
    defaultValues = DEFAULT_VALUES,
    onDelete,
    onSave,
    editMode,
    fileStore = null,
}) => {
    const handleClose = useSideDialogClose();
    const { t } = useTranslation();
    const isEditing = Boolean(defaultValues.id);

    const [initialItem] = useState(() => fromStoredFields(defaultValues));
    const [type, setType] = useState(initialItem.type);
    const [name, setName] = useState({ value: initialItem.name, error: '' });
    // Values of every type are kept, so switching type loses nothing
    const [valuesByType, setValuesByType] = useState(() => {
        const values = {};
        for (const itemType of ITEM_TYPES)
            values[itemType] = createEmptyItem(itemType).values;
        values[initialItem.type] = initialItem.values;
        return values;
    });
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [fileProgress, setFileProgress] = useState(null);

    const values = valuesByType[type];
    const fields = ITEM_FIELDS[type];
    const maxNameLength = isBackendMode()
        ? MAX_BACKEND_NAME_LENGTH
        : MAX_FIELD_LENGTH;

    const getLengthError = (value, max) => {
        if (max === MAX_FIELD_LENGTH)
            return value.length > max
                ? t('common.This field must be less than 150 characters')
                : '';
        return value.length > max
            ? t('items.This field must be at most characters', { max })
            : '';
    };

    const checkName = (value) => {
        if (value.length === 0) return t('common.This field is required');
        return getLengthError(value, maxNameLength);
    };

    const checkField = (field, value) => {
        if (field.file) {
            return field.required && !value
                ? t('common.This field is required')
                : '';
        }
        if (value.length === 0)
            return field.required ? t('common.This field is required') : '';
        if (!field.multiline) return getLengthError(value, MAX_FIELD_LENGTH);
        return '';
    };

    const setValue = (field, value) => {
        setValuesByType({
            ...valuesByType,
            [type]: { ...values, [field.id]: value },
        });
        setErrors({ ...errors, [field.id]: checkField(field, value) });
        setFormError('');
    };

    const onTypeChange = (newType) => {
        setType(newType);
        setErrors({});
        setFormError('');
    };

    const beforeSave = async () => {
        if (isSaving) return;

        const nameError = checkName(name.value);
        const newErrors = {};
        for (const field of fields)
            newErrors[field.id] = checkField(field, values[field.id]);

        setName({ value: name.value, error: nameError });
        setErrors(newErrors);

        if (nameError || Object.values(newErrors).some(Boolean)) return;

        const saveError = (e) =>
            setFormError(
                e instanceof ItemTooLargeError
                    ? t('items.The content is too large', {
                        max: formatBytes(MAX_CONTENT_BYTES),
                    })
                    : t('items.It was not possible to save it')
            );

        setIsSaving(true);
        setFormError('');

        // A file that does not fit inside the item is stored apart first
        let valuesToStore = values;
        let uploaded = null;
        const file = type === ITEM_TYPE_FILE ? values.file : null;
        if (
            file &&
            file.data &&
            fileStore &&
            fileStore.chunkBytes !== null &&
            file.size > fileStore.inlineBytes
        ) {
            try {
                uploaded = await fileStore.upload(file, setFileProgress);
            } catch (e) {
                setFileProgress(null);
                setIsSaving(false);
                saveError(e);
                return;
            }
            valuesToStore = {
                ...values,
                file: {
                    name: file.name,
                    mime: file.mime,
                    size: file.size,
                    remote: uploaded,
                },
            };
        }

        let saved;
        try {
            const stored = toStoredFields(
                { type, name: name.value, values: valuesToStore },
                fileStore
                    ? { maxContentBytes: fileStore.maxContentBytes }
                    : undefined
            );
            // If we're editing, send the id too
            saved = isEditing
                ? await onSave(stored, defaultValues.id)
                : await onSave(stored);
        } catch (e) {
            saveError(e);
            saved = false;
        }
        setIsSaving(false);
        setFileProgress(null);

        // Only an explicit `false` means it could not be saved
        if (saved === false) {
            if (uploaded !== null) fileStore.remove(uploaded);
            setFormError(
                (current) =>
                    current || t('items.It was not possible to save it')
            );
            return;
        }

        // The file this one replaces is not needed anymore
        const previousFile =
            initialItem.type === ITEM_TYPE_FILE ? initialItem.values.file : null;
        if (
            fileStore &&
            previousFile &&
            previousFile.remote &&
            (type !== ITEM_TYPE_FILE || file !== previousFile)
        )
            fileStore.remove(previousFile.remote);
    };

    const onDownloadFile = async (file) => {
        if (!file.remote) return downloadFile(file);
        const data = await fileStore.download(file, setFileProgress);
        setFileProgress(null);
        downloadFile({ ...file, data });
    };

    useDialogConfirmation(handleClose, beforeSave);

    const titleKey = isEditing ? 'items.editTitle' : 'items.newTitle';
    const title =
        type === ITEM_TYPE_PASSWORD
            ? isEditing
                ? t('passwordFormDialog.Edit password')
                : t('passwordFormDialog.New password')
            : t(`${titleKey}.${type}`);

    return (
        <>
            <SectionTitle
                title={title}
                buttons={
                    isEditing
                        ? [
                            {
                                type: 'alert',
                                label: t('common.Delete'),
                                onClick: () => onDelete(),
                            },
                        ]
                        : []
                }
            />

            {!isEditing && (
                <ItemTypeSelector value={type} onChange={onTypeChange} />
            )}

            <InputWrapper marginBottom="20px">
                <InputLabel htmlFor="name">
                    {type === ITEM_TYPE_PASSWORD
                        ? t('passwordFormDialog.Password name')
                        : t('items.Name')}
                </InputLabel>
                <Input
                    autoComplete="off"
                    autoFocus={!editMode}
                    value={name.value}
                    id="name"
                    onChange={(e) =>
                        setName({
                            value: e.target.value,
                            error: checkName(e.target.value),
                        })
                    }
                    placeholder={
                        type === ITEM_TYPE_PASSWORD
                            ? t('passwordFormDialog.My E-mail Account')
                            : t(`items.namePlaceholder.${type}`)
                    }
                    type="text"
                />
                <FieldError>{name.error}</FieldError>
            </InputWrapper>

            <Fields key={type}>
                {fields.map((field) => {
                    const id = getFieldId(type, field.id);
                    const value = values[field.id];
                    const error = errors[field.id];
                    const label = t(`items.fields.${type}.${field.id}.label`);
                    const placeholder = t(
                        `items.fields.${type}.${field.id}.placeholder`
                    );

                    return (
                        <InputWrapper key={id} marginBottom="20px">
                            <InputLabel htmlFor={id}>
                                {label}
                                {!field.required && (
                                    <Optional>{t('items.optional')}</Optional>
                                )}
                            </InputLabel>

                            {field.file ? (
                                <FileField
                                    value={value}
                                    canDownload={
                                        isEditing &&
                                        value === initialItem.values[field.id]
                                    }
                                    maxBytes={
                                        fileStore
                                            ? fileStore.maxBytes
                                            : undefined
                                    }
                                    progress={fileProgress}
                                    onDownload={onDownloadFile}
                                    onChange={(file) => setValue(field, file)}
                                    onError={(message) =>
                                        setErrors({
                                            ...errors,
                                            [field.id]: message,
                                        })
                                    }
                                />
                            ) : (
                                <FieldRow>
                                    {field.multiline ? (
                                        <TextArea
                                            autoComplete="off"
                                            spellCheck={false}
                                            id={id}
                                            value={value}
                                            placeholder={placeholder}
                                            data-monospace={Boolean(
                                                field.monospace
                                            )}
                                            style={
                                                field.tall
                                                    ? { minHeight: '260px' }
                                                    : undefined
                                            }
                                            onChange={(e) =>
                                                setValue(field, e.target.value)
                                            }
                                        />
                                    ) : (
                                        <Input
                                            autoComplete="off"
                                            spellCheck={false}
                                            id={id}
                                            type="text"
                                            value={value}
                                            placeholder={placeholder}
                                            data-monospace={Boolean(
                                                field.monospace
                                            )}
                                            onChange={(e) =>
                                                setValue(field, e.target.value)
                                            }
                                        />
                                    )}
                                    {field.copy && (
                                        <MoleculesButtonCopy value={value} />
                                    )}
                                    {field.generate && (
                                        <PasswordActionsDropdown
                                            value={value}
                                            onGenerate={(generated) =>
                                                setValue(field, generated)
                                            }
                                            currentPassword={value}
                                        />
                                    )}
                                </FieldRow>
                            )}
                            <FieldError>{error}</FieldError>
                        </InputWrapper>
                    );
                })}
            </Fields>

            {formError && (
                <FormError role="alert" data-testid="item-form-error">
                    {formError}
                </FormError>
            )}

            <ButtonWrapper>
                <Button
                    label={isEditing ? t('common.Close') : t('common.Cancel')}
                    onClick={handleClose}
                    variant="ghost"
                />
                <Button
                    label={t('common.Save')}
                    onClick={() => beforeSave()}
                    variant="primary"
                    disabled={isSaving}
                />
            </ButtonWrapper>
        </>
    );
};

PasswordFormDialogContent.displayName = 'PasswordFormDialogContent';
PasswordFormDialogContent.propTypes = {
    defaultValues: PropTypes.object,
    onClose: PropTypes.func,
    onDelete: PropTypes.func,
    onSave: PropTypes.func,
    editMode: PropTypes.bool,
    fileStore: PropTypes.object,
};

/**
 * Side dialog to create or edit an item of a folder: a password, a payment
 * card, a key pair, a file or a secure note.
 *
 * It receives and returns the four fields every item is stored with
 * (`name`, `url`, `username`, `password`), whatever the type is.
 */
const PasswordFormDialog = (props) => {
    return (
        <SideDialog onClose={props.onClose}>
            <PasswordFormDialogContent {...props} />
        </SideDialog>
    );
};

PasswordFormDialog.displayName = 'PasswordFormDialog';
PasswordFormDialog.propTypes = {
    defaultValues: PropTypes.object,
    onClose: PropTypes.func,
    onDelete: PropTypes.func,
    onSave: PropTypes.func,
    editMode: PropTypes.bool,
    fileStore: PropTypes.object,
};

export default PasswordFormDialog;
