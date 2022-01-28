// Third party dependencies
import PropTypes from 'prop-types';
import styled from 'styled-components';

const ButtonLink = styled.button`
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    font-size: 16px;
    margin: 0 2px;
    text-decoration: underline;

    &:hover{
        font-weight: bold;
    }
`;

const AtomButtonLink = ({children, onClick}) => {
    return <ButtonLink onClick={onClick}>{children}</ButtonLink>
}

AtomButtonLink.displayName = 'AtomButtonLink';
AtomButtonLink.propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func
}

export default AtomButtonLink;