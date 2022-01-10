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

const TemplateLogged = ({signOut, children, appBarMarginBottom = '35px'}) => {
    return <>
        <AppBar signOut={signOut} marginBottom={appBarMarginBottom} />
        <ContentWrapper>
            {children}
        </ContentWrapper>
    </>

}

TemplateLogged.displayName = 'TemplateLogged';
TemplateLogged.propTypes = {
    appBarMarginBottom: PropTypes.string,
    signOut: PropTypes.func,
    children: PropTypes.node,
};

export default TemplateLogged;