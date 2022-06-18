// Third party dependencies
import styled from 'styled-components';
import { Capacitor } from '@capacitor/core';

let currentNotchSize = 0;

if (Capacitor.getPlatform() === 'ios'){
    currentNotchSize = 44;
}

export const NOTCH_SIZE = currentNotchSize;

export default styled.div`
    padding-top: ${NOTCH_SIZE}px;
`;
