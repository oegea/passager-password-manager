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
import {
    mdiCheck,
    mdiDomain,
    mdiLaptop,
    mdiPlus,
    mdiTrashCanOutline,
} from '@mdi/js';
// Atoms
import Button from '../../atoms/Button/index.js';
import Icon from '../../atoms/Icon/index.js';
import IconButton from '../../atoms/IconButton/index.js';
// Organisms
import ConfirmationDialog from '../ConfirmationDialog/index.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';
import useProfiles from '../../../hooks/useProfiles/index.js';
// Own libs
import {
    addProfile,
    PROFILE_TYPE_BACKEND,
    removeProfile,
    switchProfile,
} from '../../../libs/profiles.js';
import { removeLocalFolderFiles } from '../../../libs/fileStorage.js';

const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const Row = styled.div`
    align-items: center;
    border-radius: var(--radius-md);
    display: flex;
    gap: 4px;
    transition: background-color var(--duration-fast) ease;

    &:hover {
        background: var(--color-surface-hover);
    }

    &[data-active='true'] {
        background: var(--color-accent-soft);
    }
`;

const Account = styled.button`
    align-items: center;
    appearance: none;
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    color: var(--color-text);
    cursor: pointer;
    display: flex;
    flex: 1;
    font-family: inherit;
    gap: 12px;
    min-width: 0;
    padding: 10px;
    text-align: left;
`;

const Avatar = styled.span`
    align-items: center;
    background: var(--color-surface-sunken);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    color: var(--color-text-muted);
    display: flex;
    flex-shrink: 0;
    height: 38px;
    justify-content: center;
    width: 38px;

    [data-active='true'] & {
        background: var(--color-accent);
        border-color: transparent;
        color: var(--color-accent-contrast);
    }
`;

const Text = styled.span`
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
`;

const Name = styled.span`
    font-size: 14px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Detail = styled.span`
    color: var(--color-text-muted);
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const SignedOut = styled.span`
    color: var(--color-warning);
    font-weight: 600;
`;

const Footer = styled.div`
    border-top: 1px solid var(--color-border);
    margin-top: 8px;
    padding-top: 10px;
`;

/**
 * The accounts kept in this browser: switch to one, add another, or remove
 * one for good.
 */
const OrganismProfileSwitcher = ({ onSelectActive = () => null }) => {
    const { t } = useTranslation();
    const { profiles, refresh } = useProfiles();
    const [profileToRemove, setProfileToRemove] = useState(null);

    const onSelect = (profile) => {
        if (profile.isActive && profile.isSignedIn) return onSelectActive();
        switchProfile(profile.id);
    };

    const onRemove = async () => {
        const profile = profileToRemove;
        setProfileToRemove(null);
        await removeProfile(profile.id, removeLocalFolderFiles);
        refresh();
    };

    return (
        <div data-testid="profile-switcher">
            <List>
                {profiles.map((profile) => (
                    <Row
                        key={profile.id}
                        data-active={profile.isActive}
                        data-testid="profile-row"
                    >
                        <Account type="button" onClick={() => onSelect(profile)}>
                            <Avatar>
                                <Icon
                                    path={
                                        profile.type === PROFILE_TYPE_BACKEND
                                            ? mdiDomain
                                            : mdiLaptop
                                    }
                                    size={0.8}
                                />
                            </Avatar>
                            <Text>
                                <Name data-testid="profile-name">
                                    {profile.name}
                                </Name>
                                <Detail>
                                    {profile.detail}
                                    {!profile.isSignedIn && (
                                        <SignedOut>
                                            {' · '}
                                            {t('profiles.Signed out')}
                                        </SignedOut>
                                    )}
                                </Detail>
                            </Text>
                            {profile.isActive && (
                                <Icon path={mdiCheck} size={0.75} />
                            )}
                        </Account>
                        <IconButton
                            icon={mdiTrashCanOutline}
                            label={t('profiles.Remove account')}
                            testId="profile-remove"
                            size={0.7}
                            onClick={() => setProfileToRemove(profile)}
                        />
                    </Row>
                ))}
            </List>
            <Footer>
                <Button
                    label={t('profiles.Add account')}
                    icon={mdiPlus}
                    variant="ghost"
                    testId="profile-add"
                    onClick={() => addProfile()}
                />
            </Footer>

            {profileToRemove !== null && (
                <ConfirmationDialog
                    onAccept={onRemove}
                    closeDialog={() => setProfileToRemove(null)}
                    description={
                        profileToRemove.type === PROFILE_TYPE_BACKEND
                            ? t('profiles.removeOrganizationDescription', {
                                name: profileToRemove.name,
                            })
                            : t('profiles.removeLocalDescription', {
                                name: profileToRemove.name,
                            })
                    }
                />
            )}
        </div>
    );
};

OrganismProfileSwitcher.displayName = 'OrganismProfileSwitcher';
OrganismProfileSwitcher.propTypes = {
    onSelectActive: PropTypes.func,
};

export default OrganismProfileSwitcher;
