export interface IUser {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
}

export interface AuthState {
    accessToken: string | null;
    user: IUser | null;
}