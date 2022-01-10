// Third party dependencies
import styled from 'styled-components';
import PropTypes from 'prop-types';
// Molecules
import LeftPanelLayout from '../../molecules/LeftPanelLayout/index.js';
// Organisms
import AppBar from '../../organisms/AppBar/index.js';

const ContentWrapper = styled.div`
    display: flex;
    width: 100%;
    margin: 0 auto;
    max-width: 100%;
`;

const TemplateLoggedWithLeftPanel = ({
    appBarMarginBottom = '0px',
    children,
    leftPanelContent,
    signOut,
}) => {
    return <>
        <AppBar signOut={signOut} marginBottom={appBarMarginBottom} />
        <ContentWrapper>
            <LeftPanelLayout leftPanelContent={leftPanelContent}>
                {children}
            </LeftPanelLayout>
        </ContentWrapper>
    </>

}

TemplateLoggedWithLeftPanel.displayName = 'TemplateLoggedWithLeftPanel';
TemplateLoggedWithLeftPanel.propTypes = {
    appBarMarginBottom: PropTypes.string,
    children: PropTypes.node,
    leftPanelContent: PropTypes.node,
    signOut: PropTypes.func,
};

export default TemplateLoggedWithLeftPanel;