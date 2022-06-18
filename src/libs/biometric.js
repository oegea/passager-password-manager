import { NativeBiometric } from "capacitor-native-biometric";

const DOMAIN = "im.oriol.passager";

export const loginWithCredentialsIfAvailable = async () => {
    const biometrics = await NativeBiometric.isAvailable()
    if (biometrics.isAvailable) {
        const credentials = await NativeBiometric.getCredentials({
            server: DOMAIN
        });
        await NativeBiometric.verifyIdentity({
            reason: "For easy log in",
            title: "Log in",
            subtitle: "Maybe add subtitle here?",
            description: "Maybe a description too?",
        });
        return credentials.password
    }

    return null
}

export const setCredentials = async (password) => {
    await NativeBiometric.setCredentials({
        username: "",
        password,
        server: DOMAIN
    });
}