export interface UserData {
    userinfo: Array<{
        displayName: string | null;
        email: string | null;
        uid: string | null;
        photoURL: string | null;
        phoneNumber: string | null;
    }>;
    backgroundImageURL: string | null;
    emailVerified: boolean | null;
}