// Third party dependencies
import {
    BrowserRouter,
    Routes, 
    Route
} from 'react-router-dom';
import PropTypes from 'prop-types';
// Pages
import Home from './components/pages/Home/index.js';
import Login from './components/pages/Login/index.js';
import UserSignup from './components/pages/UserSignup/index.js';
import UserMasterPasswordValidation from './components/pages/UserMasterPasswordValidation/index.js';
// Context
import withUser from './providers/WithUser.js';

const RoutesConfiguration = ({user}) => {

    return (
    <BrowserRouter>

        {user !== null && user.initialized === true && user.decryptedPrivateKey === false &&
        <Routes>
            <Route path="/" element={<UserMasterPasswordValidation />} />
        </Routes>}

        {user !== null && user.initialized === true && user.decryptedPrivateKey === true &&
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:folderId" element={<Home />} />
        </Routes>}

        {user !== null && !user.initialized &&
        <Routes>
            <Route path="/" element={<UserSignup />} />
        </Routes>}

        {user === null &&
        <Routes>
            <Route path="/" element={<Login />} />
        </Routes>
        }
    </BrowserRouter>);
}

RoutesConfiguration.displayName = 'Routes';
RoutesConfiguration.propTypes = {
    user: PropTypes.object,
};

export default withUser(RoutesConfiguration);