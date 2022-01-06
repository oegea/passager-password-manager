// Third party dependencies
import styled from 'styled-components';

const Input = styled.input`
    border: 1px solid black;
    border-radius: 5px;
    font-size: 16px;
    height: 25px;
    padding: 5px;
    width: 100%;

    &::placeholder {
        font-size: 16px;
    }
`;
const AtomInput = (props) => {
    return <Input {...props} />
}

AtomInput.displayName = 'AtomInput';

export default AtomInput;