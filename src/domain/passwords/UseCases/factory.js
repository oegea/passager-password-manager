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

// Factories
import {PasswordsServicesFactory} from '../Services/factory.js';
// Use cases
import {CreatePasswordUseCase} from './CreatePasswordUseCase.js';
import {DeletePasswordUseCase} from './DeletePasswordUseCase.js';
import {EditPasswordUseCase} from './EditPasswordUseCase.js';

export class PasswordsUseCasesFactory {
    static createPasswordUseCase = ({config}) => 
        new CreatePasswordUseCase({
            service: PasswordsServicesFactory.createPasswordService({config})
        });

    static deletePasswordUseCase = ({config}) =>
        new DeletePasswordUseCase({
            service: PasswordsServicesFactory.deletePasswordService({config})
        });

    static editPasswordUseCase = ({config}) =>
        new EditPasswordUseCase({
            service: PasswordsServicesFactory.editPasswordService({config})
        });
}