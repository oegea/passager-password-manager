// Third party dependencies
import styled from 'styled-components';
import PropTypes from 'prop-types';
// Organisms
import AppBar from '../../organisms/AppBar/index.js';

const TemplateLogged = ({children}) => {

    const ContentWrapper = styled.div`
        width: 70%;
        margin: 0 auto;
        max-width: 70%;
    `;

    return <>
        <AppBar />
        <ContentWrapper>
            {children}
        </ContentWrapper>
    </>

}

TemplateLogged.displayName = 'TemplateLogged';
TemplateLogged.propTypes = {
    children: PropTypes.node,
};

export default TemplateLogged;