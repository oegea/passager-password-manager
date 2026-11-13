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
// Atoms
import Button from '../../atoms/Button/index.js';

const Wrapper = styled.div`
    animation: passager-fade-up var(--duration-slow) var(--ease-out) both;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    color: var(--color-text);
    font-size: 14px;
    max-width: 420px;
    padding: 18px;

    @media (max-width: 768px) {
        max-width: none;
    }
`;

const Title = styled.p`
    font-size: 15px;
    font-weight: 700;
    margin: 0 0 6px 0;
`;

const Description = styled.p`
    color: var(--color-text-muted);
    margin: 0 0 14px 0;
`;

const ErrorMessage = styled.p`
    color: var(--color-danger);
    font-weight: 500;
    margin: 0 0 14px 0;
`;

const Actions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`;

/**
 * A non-blocking notice with optional actions.
 */
const MoleculeNotice = ({
    title,
    description,
    error,
    actions = [],
    testId,
}) => {
    return (
        <Wrapper role="status" data-testid={testId}>
            <Title>{title}</Title>
            {description && <Description>{description}</Description>}
            {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
            {actions.length > 0 && (
                <Actions>
                    {actions.map((action) => (
                        <Button
                            key={action.label}
                            label={action.label}
                            onClick={action.onClick}
                            variant={action.variant}
                        />
                    ))}
                </Actions>
            )}
        </Wrapper>
    );
};

MoleculeNotice.displayName = 'MoleculeNotice';
MoleculeNotice.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    error: PropTypes.string,
    actions: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            onClick: PropTypes.func.isRequired,
            variant: PropTypes.string,
        })
    ),
    testId: PropTypes.string,
};

export default MoleculeNotice;
