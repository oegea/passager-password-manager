// Third party dependencies
import {useEffect} from 'react';

const useDialogConfirmation = (closeHandler, enterHandler = () => false, name = '') => {
    useEffect(() => {
        const onKeyPress = (e) => {
            const keyCode = e.code || e.key;
            if (
                (keyCode === 'Enter' && enterHandler(name))
                || keyCode === 'Escape'
            ) {
                closeHandler();
            }
        }
        window.addEventListener('keydown', onKeyPress)
        return () => window.removeEventListener('keydown', onKeyPress)
    },[name, enterHandler, closeHandler])
}

export default useDialogConfirmation;