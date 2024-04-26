import { TagDataDTO } from "../pages/Dashboard";
import { BaseService } from "./base.service";

export class GitService extends BaseService {
    public async getConfigs(): Promise<any> {
        return await this.get<any>("/git/config");
    }

    public async getConfig(dir: string): Promise<any> {
        return await this.get<any>(`/git/config/${dir}`);
    }

    public async refreshConfig(): Promise<any> {
        return await this.get<any>(`/git/refresh-config`);
    }

    public async getReleases(dir: string): Promise<any> {
        return await this.get<any>(`/git/config/${dir}/releases`);
    }

    public async getVersions(dir: string): Promise<any> {
        return await this.get<any>(`/git/config/${dir}/versions`);
    }

    public async checkPrecedenceForChangeList(changeList: TagDataDTO[]): Promise<any> {
        return await this.post<any>("/git/check-precedence", changeList);
    }

    public async commitChanges(changeList: TagDataDTO[]): Promise<any> {
        return await this.post<any>("/git/commit-changes", changeList);
    }

    public async deployVersion(tagData: object): Promise<any> {
        return await this.post<any>("/git/update-version", tagData);
    }
}