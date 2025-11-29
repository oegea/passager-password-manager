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
import Icon from '@mdi/react';
import { mdiFolder } from '@mdi/js';
// Molecules
import SectionTitle from '../../molecules/SectionTitle/index.js';
import GlobalSpinner from '../../molecules/GlobalSpinner/index.js';
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
} from '../../../libs/passwords.js';
import { isMobileDevice } from '../../../libs/mobile.js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';
// Context
import withUser from '../../../providers/WithUser.js';
import withFolders from '../../../providers/WithFolders.js';
// Domain
import domain from '../../../domain/index.js';

const ResultsContainer = styled.div`
    padding: 0;
`;

const SearchHeader = styled.div`
    margin-bottom: 30px;
`;

const SearchQuery = styled.h1`
    font-size: 24px;
    color: #1a1a1a;
    margin: 0 0 8px 0;
    font-weight: 600;

    @media (max-width: 768px) {
        font-size: 20px;
    }
`;

const SearchMeta = styled.div`
    font-size: 14px;
    color: #666;
`;

const FolderSection = styled.div`
    margin-bottom: 24px;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e8e8e8;
    transition: box-shadow 0.2s ease;

    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
`;

const FolderHeader = styled.div`
    padding: 16px 20px;
    background: linear-gradient(to right, #f8f9fa, #ffffff);
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 768px) {
        padding: 14px 16px;
    }
`;

const FolderTitleWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
`;

const FolderTitle = styled.h2`
    font-size: 16px;
    margin: 0;
    color: #2c3e50;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
        color: #1a1a1a;
    }
`;

const ResultCount = styled.span`
    font-size: 13px;
    color: #666;
    background: #f0f0f0;
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: 500;
`;

const NoResults = styled.div`
    text-align: center;
    padding: 80px 20px;
    color: #999;
    font-size: 16px;
`;

const TableWrapper = styled.div`
    padding: 0;
    background: #fff;
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
        await editPassword(
            editState.folderId,
            passwordId,
            password,
            editState.folderKey,
            user.privateKey
        );
        setShowSpinner(false);
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

                {isSearching && <GlobalSpinner />}

                {!isSearching && results.length === 0 && (
                    <NoResults>
                        {t('searchResults.No results found')} &quot;{query}&quot;
                    </NoResults>
                )}

                {results.map(({ folder, passwords }) => {
                    const folderData = allFolders.find((f) => f.id === folder.id);

                    // Preparar las columnas según si es mobile o no
                    let tableColumns = [t('documentsListRightPanel.Title')];
                    if (!isMobileDevice()) {
                        tableColumns.push(t('documentsListRightPanel.Website'));
                    }

                    // Preparar las filas para la tabla
                    const passwordsRows = passwords.map((password) =>
                        !isMobileDevice()
                            ? [password.name || '', password.url || '']
                            : [password.name || '']
                    );

                    return (
                        <FolderSection key={folder.id}>
                            <FolderHeader>
                                <FolderTitleWrapper>
                                    <Icon path={mdiFolder} size={0.8} color="#2c3e50" />
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
