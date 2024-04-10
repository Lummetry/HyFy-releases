export interface UserModel {
    uuid?: string;
    username: string;
    password?: string;
    name: string;
    role: string;
    token?: string;
}