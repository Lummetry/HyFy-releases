import { BaseService } from "./base.service";

export class GitService extends BaseService {
    public async getConfig(): Promise<any> {
        return await this.get<any>("/git/config");
    }

    public async getVersions(dir: string): Promise<any> {
        return await this.get<any>(`/git/config/${dir}`);
    }

    public async deployVersion(tagData: object): Promise<any> {
        return await this.post<any>("/git/update-version", tagData);
    }
}