// Third party dependencies
import styled from 'styled-components';
import PropTypes from 'prop-types';
// Organisms
import AppBar from '../../organisms/AppBar/index.js';

const ContentWrapper = styled.div`
    width: 70%;
    margin: 0 auto;
    max-width: 70%;
`;

const TemplateLogged = ({signOut, children}) => {
    return <>
        <AppBar signOut={signOut} />
        <ContentWrapper>
            {children}
        </ContentWrapper>
    </>

}

TemplateLogged.displayName = 'TemplateLogged';
TemplateLogged.propTypes = {
    signOut: PropTypes.func,
    children: PropTypes.node,
};

export default TemplateLogged;