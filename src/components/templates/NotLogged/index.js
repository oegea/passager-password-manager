// Third party dependencies
import styled from 'styled-components';
import PropTypes from 'prop-types';

const Wrapper = styled.div`
    align-items: center;
    display: flex;
    height: 100vh;
    justify-content: center;
    background: grey;
`;

const Content = styled.div`
    background: white;
    border-radius: 10px;
    padding: 30px;
`;

const TemplateNotLogged = ({children}) => {

    return <>
        <Wrapper>
            <Content>
                {children}
            </Content>
        </Wrapper>
    </>

}

TemplateNotLogged.displayName = 'TemplateNotLogged';
TemplateNotLogged.propTypes = {
    children: PropTypes.node,
};

export default TemplateNotLogged;