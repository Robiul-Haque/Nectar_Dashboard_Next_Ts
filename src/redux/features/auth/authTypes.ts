export interface IUser {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    avatar?: string;
}

export interface AuthState {
    accessToken: string | null;
    user: IUser | null;
}