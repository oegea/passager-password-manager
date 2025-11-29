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
import Icon from '@mdi/react';
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
    border: none;
    border-radius: 20px;
    font-size: 14px;
    height: 35px;
    padding: 0 15px 0 40px;
    width: 300px;
    max-width: 100%;
    background-color: rgba(255, 255, 255, 0.9);
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        background-color: rgba(255, 255, 255, 1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &::placeholder {
        font-size: 14px;
        color: #888;
    }

    @media (max-width: 768px) {
        width: 40px;
        padding: 0;
        padding-left: 40px;
        background-color: transparent;
        color: transparent;

        &::placeholder {
            opacity: 0;
        }

        &:focus {
            width: 100%;
            background-color: rgba(255, 255, 255, 1);
            padding-right: 15px;
            color: #333;

            &::placeholder {
                opacity: 1;
            }
        }
    }
`;

const SearchIconWrapper = styled.div`
    position: absolute;
    left: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 50%;
    transition: background-color 0.2s ease;

    @media (min-width: 769px) {
        cursor: default;
        pointer-events: none;
    }

    @media (max-width: 768px) {
        &:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }

        &:active {
            background-color: rgba(255, 255, 255, 0.2);
        }
    }
`;

const SearchIcon = styled(Icon)`
    color: ${props => props.$isFocused ? '#666' : '#fff'};
    filter: ${props => props.$isFocused ? 'none' : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'};
    transition: color 0.3s ease, filter 0.3s ease;

    @media (min-width: 769px) {
        color: #666;
        filter: none;
    }
`;

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
