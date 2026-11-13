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

/**
 * Renders a Material Design icon from its SVG path (see `@mdi/js`).
 * A numeric `size` is a multiplier of 1.5rem (the scale `@mdi/react` used);
 * a string is used as it is. Any other prop reaches the `<svg>` element.
 */
const AtomIcon = ({
    path,
    size = 1,
    color = 'currentColor',
    title,
    ...rest
}) => {
    const dimension = typeof size === 'string' ? size : `${size * 1.5}rem`;
    return (
        <svg
            viewBox="0 0 24 24"
            role={title ? 'img' : 'presentation'}
            aria-hidden={title ? undefined : true}
            style={{ width: dimension, height: dimension }}
            {...rest}
        >
            {title && <title>{title}</title>}
            <path d={path} style={{ fill: color }} />
        </svg>
    );
};

AtomIcon.displayName = 'AtomIcon';
AtomIcon.propTypes = {
    path: PropTypes.string.isRequired,
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    color: PropTypes.string,
    title: PropTypes.string,
};

export default AtomIcon;
