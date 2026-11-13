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

import {
    mdiCreditCardOutline,
    mdiFileOutline,
    mdiKeyChainVariant,
    mdiKeyOutline,
    mdiNoteTextOutline,
} from '@mdi/js';
import {
    ITEM_TYPE_CARD,
    ITEM_TYPE_FILE,
    ITEM_TYPE_KEY_PAIR,
    ITEM_TYPE_NOTE,
    ITEM_TYPE_PASSWORD,
} from './items.js';

/** Icon and accent colour of each item type. */
export const ITEM_ICONS = {
    [ITEM_TYPE_PASSWORD]: { icon: mdiKeyOutline, color: '#6366f1' },
    [ITEM_TYPE_CARD]: { icon: mdiCreditCardOutline, color: '#0ea5e9' },
    [ITEM_TYPE_KEY_PAIR]: { icon: mdiKeyChainVariant, color: '#f59e0b' },
    [ITEM_TYPE_FILE]: { icon: mdiFileOutline, color: '#10b981' },
    [ITEM_TYPE_NOTE]: { icon: mdiNoteTextOutline, color: '#ec4899' },
};
