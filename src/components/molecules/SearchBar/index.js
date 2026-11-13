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
import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import Icon from '../../atoms/Icon/index.js';
import { mdiMagnify } from '@mdi/js';
// Hooks
import useTranslation from '../../../hooks/useTranslation/index.js';

const SearchContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;

    @media (max-width: 768px) {
        ${props => props.$isFocused && `
            position: fixed;
            left: 10px;
            right: 10px;
            top: 12px;
            z-index: 1000;
        `}
    }
`;

const SearchInput = styled.input`
    appearance: none;
    background: var(--color-surface-sunken);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    color: var(--color-text);
    font-family: inherit;
    font-size: 14px;
    height: 40px;
    max-width: 100%;
    padding: 0 16px 0 42px;
    transition: width var(--duration-base) var(--ease-out),
        background-color var(--duration-fast) ease,
        border-color var(--duration-fast) ease,
        box-shadow var(--duration-fast) ease;
    width: 320px;

    &:focus {
        background: var(--color-surface);
        border-color: var(--color-accent);
        box-shadow: 0 0 0 4px var(--color-accent-ring);
        outline: none;
        width: 380px;
    }

    &::placeholder {
        color: var(--color-text-faint);
    }

    @media (max-width: 768px) {
        background: transparent;
        border-color: transparent;
        color: transparent;
        padding: 0 0 0 40px;
        width: 40px;

        &::placeholder {
            opacity: 0;
        }

        &:focus {
            background: var(--color-surface);
            color: var(--color-text);
            padding-right: 16px;
            width: 100%;

            &::placeholder {
                opacity: 1;
            }
        }
    }
`;

const SearchIconWrapper = styled.div`
    align-items: center;
    border-radius: 50%;
    color: var(--color-text-faint);
    cursor: pointer;
    display: flex;
    height: 40px;
    justify-content: center;
    left: 0;
    position: absolute;
    width: 42px;

    @media (min-width: 769px) {
        cursor: default;
        pointer-events: none;
    }

    @media (max-width: 768px) {
        color: var(--color-text-muted);

        &:hover {
            background: var(--color-surface-hover);
        }
    }
`;

const SearchIcon = styled(Icon)``;

const MoleculeSearchBar = ({ onFocusChange }) => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    // Sincronizar el input con el parámetro de búsqueda de la URL
    useEffect(() => {
        const queryParam = searchParams.get('q');
        if (queryParam) {
            setSearchQuery(queryParam);
        } else if (location.pathname !== '/search') {
            // Solo limpiar el input si no estamos en la página de búsqueda
            setSearchQuery('');
        }
    }, [searchParams, location.pathname]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (searchQuery.trim()) {
                navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            } else {
                navigate('/');
            }
            inputRef.current?.blur();
        }
    };

    const handleIconClick = () => {
        inputRef.current?.focus();
    };

    const handleFocus = () => {
        setIsFocused(true);
        onFocusChange?.(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
        onFocusChange?.(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                inputRef.current?.blur();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <SearchContainer ref={containerRef} $isFocused={isFocused}>
            <SearchIconWrapper onClick={handleIconClick}>
                <SearchIcon path={mdiMagnify} size={0.8} $isFocused={isFocused} />
            </SearchIconWrapper>
            <SearchInput
                ref={inputRef}
                type="text"
                placeholder={t('topbar.Search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
            />
        </SearchContainer>
    );
};

MoleculeSearchBar.displayName = 'MoleculeSearchBar';
MoleculeSearchBar.propTypes = {
    onFocusChange: PropTypes.func,
};

export default MoleculeSearchBar;
