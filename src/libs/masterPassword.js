export const checkPassword = (password) => {
    let strengthValue = {
        'caps': false,
        'length': false,
        'special': false,
        'numbers': false,
        'small': false
    };

    if(password.length >= 8) {
        strengthValue.length = true;
    }

    if(password.match(/[A-Z]/)) {
        strengthValue.caps = true;
    }

    if(password.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/)) {
        strengthValue.special = true;
    }

    if(password.match(/[0-9]/)) {
        strengthValue.numbers = true;
    }

    if(password.match(/[a-z]/)) {
        strengthValue.small = true;
    }

    return strengthValue;
}