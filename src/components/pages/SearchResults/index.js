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
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Icon from '../../atoms/Icon/index.js';
import { mdiFolder, mdiMagnifyClose } from '@mdi/js';
// Atoms
import LinearProgress from '../../atoms/LinearProgress/index.js';
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
import GlobalSpinner from '../../molecules/GlobalSpinner/index.js';
import EmptyState from '../../molecules/EmptyState/index.js';
import { getItemRows } from '../../molecules/ItemName/index.js';
// Organisms
import Table from '../../organisms/Table/index.js';
import PasswordFormDialog from '../../organisms/PasswordFormDialog/index.js';
import ConfirmationDialog from '../../organisms/ConfirmationDialog/index.js';
import FoldersListLeftPanel from '../../organisms/FoldersListLeftPanel/index.js';
// Templates
import LoggedWithLeftPanel from '../../templates/LoggedWithLeftPanel/index.js';
// Own libs
import { logout } from '../../../libs/auth.js';
import {
    decryptPassword,
    deletePassword,
    editPassword,
    wasSaved,
} from '../../../libs/passwords.js';
import { fromStoredFields, ITEM_TYPE_FILE } from '../../../libs/items.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';
import useFileStore from '../../../hooks/useFileStore/index.js';
// Context
import withUser from '../../../providers/WithUser.js';
import withFolders from '../../../providers/WithFolders.js';
// Domain
import domain from '../../../domain/index.js';

const ResultsContainer = styled.div`
    padding: 0;
`;

const SearchHeader = styled.div`
    margin-bottom: 24px;
`;

const SearchQuery = styled.h1`
    color: var(--color-text);
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 6px 0;

    @media (max-width: 768px) {
        font-size: 20px;
    }
`;

const SearchMeta = styled.div`
    color: var(--color-text-muted);
    font-size: 14px;
`;

const FolderSection = styled.div`
    animation: passager-fade-up var(--duration-base) var(--ease-out) both;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    margin-bottom: 20px;
    overflow: hidden;
`;

const FolderHeader = styled.div`
    align-items: center;
    background: var(--color-surface-sunken);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    padding: 14px 16px;
`;

const FolderTitleWrapper = styled.div`
    align-items: center;
    color: var(--color-accent);
    display: flex;
    flex: 1;
    gap: 8px;
`;

const FolderTitle = styled.h2`
    color: var(--color-text);
    cursor: pointer;
    font-size: 15px;
    font-weight: 600;
    margin: 0;
    transition: color var(--duration-fast) ease;

    &:hover {
        color: var(--color-accent);
    }
`;

const ResultCount = styled.span`
    background: var(--color-accent-soft);
    border-radius: var(--radius-full);
    color: var(--color-accent);
    font-size: 12px;
    font-weight: 700;
    padding: 3px 10px;
`;

const TableWrapper = styled.div`
    padding: 0;
`;

const PageSearchResults = ({ user, folders = [], sharedFolders = [] }) => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(true);
    const [editState, setEditState] = useState({ showDialog: false, password: {}, folderId: null, folderKey: null });
    const [deleteState, setDeleteState] = useState({ showDialog: false, password: null });
    const [showSpinner, setShowSpinner] = useState(false);

    const searchUseCaseRef = useRef(null);
    const fileStore = useFileStore({
        folderId: editState.folderId,
        folderKey: editState.folderKey,
        user,
    });

    useEffect(() => {
        if (!query || !user) return;

        setResults([]);
        setIsSearching(true);

        // Obtener el caso de uso de búsqueda
        const searchUseCase = domain.useCases.passwords.search_passwords_use_case;
        searchUseCaseRef.current = searchUseCase;

        // Ejecutar la búsqueda
        searchUseCase.execute({
            query,
            userId: user.uid,
            userPrivateKey: user.privateKey,
            onFolderResults: ({ folder, passwords }) => {
                setResults((prevResults) => [
                    ...prevResults,
                    { folder, passwords },
                ]);
            },
            onSearchComplete: () => {
                setIsSearching(false);
            },
        });

        // Cleanup: abortar la búsqueda cuando el componente se desmonte o cambie la query
        return () => {
            if (searchUseCaseRef.current) {
                searchUseCaseRef.current.abort();
            }
        };
    }, [query, user]);

    const onEditPassword = async (password, folderId, folderKey) => {
        const decryptedPassword = await decryptPassword(
            password,
            folderKey,
            user.privateKey
        );
        setEditState({
            showDialog: true,
            password: { ...password, ...decryptedPassword },
            folderId,
            folderKey,
        });
    };

    const refreshSearch = () => {
        if (!query || !user) return;

        setResults([]);
        setIsSearching(true);

        const searchUseCase = domain.useCases.passwords.search_passwords_use_case;
        searchUseCaseRef.current = searchUseCase;

        searchUseCase.execute({
            query,
            userId: user.uid,
            userPrivateKey: user.privateKey,
            onFolderResults: ({ folder, passwords }) => {
                setResults((prevResults) => [
                    ...prevResults,
                    { folder, passwords },
                ]);
            },
            onSearchComplete: () => {
                setIsSearching(false);
            },
        });
    };

    const onSaveEditPassword = async (password, passwordId) => {
        setShowSpinner(true);
        const saved = await wasSaved(() =>
            editPassword(
                editState.folderId,
                passwordId,
                password,
                editState.folderKey,
                user.privateKey
            )
        );
        setShowSpinner(false);
        if (!saved) return false;
        setEditState({ showDialog: false, password: {}, folderId: null, folderKey: null });

        // Refrescar resultados de búsqueda
        setTimeout(() => refreshSearch(), 500);
    };

    const onDeletePassword = () => {
        setDeleteState({
            showDialog: true,
            password: editState.password.id,
        });
    };

    const onConfirmDelete = async () => {
        const item = fromStoredFields(editState.password);
        if (item.type === ITEM_TYPE_FILE && item.values.file?.remote)
            fileStore.remove(item.values.file.remote);
        await deletePassword(editState.folderId, deleteState.password);
        setDeleteState({ showDialog: false, password: null });
        setEditState({ showDialog: false, password: {}, folderId: null, folderKey: null });

        // Refrescar resultados de búsqueda
        setTimeout(() => refreshSearch(), 500);
    };

    const allFolders = [...folders, ...sharedFolders];
    const leftPanel = <FoldersListLeftPanel />;

    const totalResults = results.reduce((acc, { passwords }) => acc + passwords.length, 0);

    return (
        <LoggedWithLeftPanel signOut={logout} leftPanelContent={leftPanel}>
            <ResultsContainer>
                <SearchHeader>
                    <SearchQuery>&quot;{query}&quot;</SearchQuery>
                    {!isSearching && totalResults > 0 && (
                        <SearchMeta>
                            {totalResults} {totalResults === 1 ? t('searchResults.result') : t('searchResults.results')} {t('searchResults.in')} {results.length} {results.length === 1 ? t('searchResults.folder') : t('searchResults.folders')}
                        </SearchMeta>
                    )}
                </SearchHeader>

                {isSearching && <LinearProgress />}

                {!isSearching && results.length === 0 && (
                    <EmptyState
                        icon={mdiMagnifyClose}
                        title={`${t('searchResults.No results found')} "${query}"`}
                    />
                )}

                {results.map(({ folder, passwords }) => {
                    const folderData = allFolders.find((f) => f.id === folder.id);

                    const tableColumns = [
                        t('documentsListRightPanel.Title'),
                        t('documentsListRightPanel.Website'),
                    ];

                    const passwordsRows = getItemRows(passwords, t);

                    return (
                        <FolderSection key={folder.id}>
                            <FolderHeader>
                                <FolderTitleWrapper>
                                    <Icon path={mdiFolder} size={0.8} />
                                    <FolderTitle onClick={() => navigate(`/${folder.id}`)}>
                                        {folderData?.name || t('searchResults.Folder')}
                                    </FolderTitle>
                                </FolderTitleWrapper>
                                <ResultCount>{passwords.length}</ResultCount>
                            </FolderHeader>
                            <TableWrapper>
                                <Table
                                    columns={tableColumns}
                                    rows={passwordsRows}
                                    onClick={(rowIndex) => {
                                        onEditPassword(passwords[rowIndex], folder.id, folder.key);
                                    }}
                                />
                            </TableWrapper>
                        </FolderSection>
                    );
                })}
            </ResultsContainer>

            {editState.showDialog && (
                <PasswordFormDialog
                    fileStore={fileStore}
                    key={editState.password.id}
                    defaultValues={editState.password}
                    onClose={() => setEditState({ showDialog: false, password: {}, folderId: null, folderKey: null })}
                    onDelete={onDeletePassword}
                    onSave={onSaveEditPassword}
                    editMode
                />
            )}

            {deleteState.showDialog && (
                <ConfirmationDialog
                    onAccept={onConfirmDelete}
                    closeDialog={() => setDeleteState({ showDialog: false, password: null })}
                    description={t('documentsListRightPanel.deletePasswordConfirmationDescription')}
                />
            )}

            {showSpinner && <GlobalSpinner />}
        </LoggedWithLeftPanel>
    );
};

export default withUser(withFolders(PageSearchResults));
