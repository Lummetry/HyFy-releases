import { TokenModel } from "../models/Token";
import { UserModel } from "../models/User";
import {BaseService} from "./base.service";

export class UserService extends BaseService {
    public async login(username: string, password: string): Promise<TokenModel> {
        const data = new FormData();
        data.append("username", username);
        data.append("password", password);

        return await this.post<TokenModel>("/token", data);
    }

    public async getUsers(): Promise<any> {
        return await this.get<any>("/users/");
    }

    public async getUser(uuid: string): Promise<UserModel> {
        return await this.get<UserModel>(`/users/${uuid}`);
    }

    public async createUser(data: UserModel): Promise<UserModel> {
        return await this.post<UserModel>("/users/", data);
    }

    public async updateUser(uuid: string, data: UserModel): Promise<UserModel> {
        return await super.put<UserModel>(`/users/${uuid}`, data);
    }

    public async deleteUser(uuid: string): Promise<void> {
        return await this.delete<void>(`/users/${uuid}`);
    }
}