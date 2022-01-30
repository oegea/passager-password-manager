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
// Context
import withUser from './providers/WithUser.js';

const RoutesConfiguration = ({user}) => {
    return (
    <BrowserRouter>
        {user !== null && 
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:folderId" element={<Home />} />
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