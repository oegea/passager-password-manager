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
            title: "Log in to Passager",
            subtitle: "Access Passager without having to remember your master password",
            description: "Please use a biometric device to identify yourself",
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