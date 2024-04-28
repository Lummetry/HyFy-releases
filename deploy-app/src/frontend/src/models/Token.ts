import { UserModel } from "./User";

export class TokenModel {
    public access_token: string;
    public token_type: string;
    public role: string;
    public expires_in: number;
    public token?: string;
    public name?: string;

    constructor(accessToken: string, tokenType: string, role: string, expiresIn: number, name?: string) {
        this.access_token = accessToken;
        this.token_type = tokenType;
        this.role = role;
        this.expires_in = expiresIn;
        this.name = name;
    }
}

export class TokenValidation {
    public success: boolean;
    public profile?: UserModel;

    constructor(success: boolean, profile?: UserModel) {
        this.success = success;
        this.profile = profile;
    }
}