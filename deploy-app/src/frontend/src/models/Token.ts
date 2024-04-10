export class TokenModel {
    public access_token: string;
    public token_type: string;
    public role: string;
    public expires_in: number;

    constructor(accessToken: string, tokenType: string, role: string, expiresIn: number) {
        this.access_token = accessToken;
        this.token_type = tokenType;
        this.role = role;
        this.expires_in = expiresIn;
    }
}