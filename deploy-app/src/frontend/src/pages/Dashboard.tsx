import { useContext, useEffect, useState } from 'react';
import { Container, Typography, Tabs, Tab, Box } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import { GitService } from '../services/git.service';
import BasicTableWithActions from '../components/BasicTableWithActions';
import DeployButton from '../components/DeployButton';
import GlobalContext from '../contexts/GlobalContext';

interface TagDataDTO {
    tag: string;
    directory: string;
    environment: string;
}

interface K8STableRow {
    version: string;
    backend_image: string;
    frontend_image: string;
    summary: string;
}

interface GetConfigDto {
    directory_name: string;
    application_name: string;
    application_type: string;
}

const gitService = new GitService();

const Dashboard = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [config, setConfig] = useState<GetConfigDto[]>([]);
    const [currentConfig, setCurrentConfig] = useState<object>({});
    const [tableColumns, setTableColumns] = useState<{ label: string; field: string; }[]>([]);
    const [_tableRows, setTableRows] = useState<{ [key: string]: any }>([]);

    const { addSnackBar } = useContext(GlobalContext);

    useEffect(() => {
        gitService.getConfig().then((data: GetConfigDto[]) => {
            setConfig(data);
            gitService.getVersions(data[0].directory_name).then((app: object) => {
                // @ts-ignore
                const versions = app.application.versions;
                setCurrentConfig(versions);
                setSelectedTab(0);
                const currentConfig = data[0];
                if (currentConfig.application_type === 'k8s') {
                    setTableColumns([
                        {label: 'Version', field: 'version'}, 
                        {label: 'Backend Image', field: 'backend_image'}, 
                        {label: 'Frontend Image', field: 'frontend_image'},
                        {label: 'Summary', field: 'summary'},
                    ]);
                    setTableRows(k8sRows(versions));
                }

                if (currentConfig.application_type == 'edge') {
                    setTableColumns([
                        {label: 'Version', field: 'version'}, 
                        {label: 'Summary', field: 'summary'},
                    ]);
                    setTableRows(e2Rows(versions));
                }
            });
        });
    }, []);

    useEffect(() => {
        if (config.length > 0) {
            const gitService = new GitService();
            gitService.getVersions(config[selectedTab].directory_name).then((app: object) => {
                // @ts-ignore
                const versions = app.application.versions;
                setCurrentConfig(versions);
                if (config[selectedTab].application_type === 'k8s') {
                    setTableColumns([
                        {label: 'Version', field: 'version'}, 
                        {label: 'Backend Image', field: 'backend_image'}, 
                        {label: 'Frontend Image', field: 'frontend_image'},
                        {label: 'Summary', field: 'summary'},
                    ]);
                    setTableRows(k8sRows(versions));
                }

                if (config[selectedTab].application_type == 'edge') {
                    setTableColumns([
                        {label: 'Version', field: 'version'}, 
                        {label: 'Summary', field: 'summary'},
                    ]);
                    setTableRows(e2Rows(versions));
                }
            });
        }
    }, [selectedTab]);

    const handleTabChange = (_event: object, newValue: number) => {
        setSelectedTab(newValue);
    };

    const k8sActionsColumn = (row: K8STableRow) => {

        const handleOnSelection = (env: string) => {
            const tagData = {
                tag: row.version,
                directory: config[selectedTab].directory_name,
                environment: env,
            } as TagDataDTO;

            gitService.deployVersion(tagData).then(() => {
                let message = `Deployed ${row.version} to ${env}`;
                if (addSnackBar) {
                    addSnackBar({ message, type: 'success', duration: 5000 });
                }
            }).catch((error) => {
                let message = `${error.response.data.detail || error.message}`;
                if (addSnackBar) {
                    addSnackBar({ message, type: 'error', duration: 10000 });
                }
            });
        };
        return (
            <>
                <DeployButton onSelection={handleOnSelection} />
            </>
        );
    };

    const k8sRows = (versions: { [key: string]: any }) => {
        let rows = [];
        for (let version in versions) {
            rows.push({
                version: version,
                backend_image: versions[version]?.backend?.image,
                frontend_image: versions[version]?.frontend?.image,
                summary: versions[version].summary,
            });
        }
        return rows;
    };

    const e2Rows = (versions: { [key: string]: any }) => {
        let rows = [];
        for (let version in versions) {
            rows.push({
                version: version,
                summary: versions[version].summary,
            });
        }
        return rows;
    };

    const renderTabContent = (tabIndex: number) => {
        switch (tabIndex) {
            case 0:
                return <BasicTableWithActions keyColumn='version' columns={tableColumns} rows={e2Rows(currentConfig)} actionColumn={k8sActionsColumn} />;
            case 1:
                return <BasicTableWithActions keyColumn='version' columns={tableColumns} rows={k8sRows(currentConfig)} actionColumn={k8sActionsColumn} />;
            case 2:
                
                return <BasicTableWithActions keyColumn='version' columns={tableColumns} rows={k8sRows(currentConfig)} actionColumn={k8sActionsColumn} />;
            default:
                return <Typography>Content for unknown Tab</Typography>;
        }
    };

    return (
        <MainLayout>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Tagger
                </Typography>
                <Tabs value={selectedTab} onChange={handleTabChange} aria-label="dashboard tabs">
                    {config.map((item, index) => (
                        <Tab key={index} label={item.application_name} />
                    ))}
                </Tabs>
                <Box sx={{ mt: 2 }}>
                    {renderTabContent(selectedTab)}
                </Box>
            </Container>
        </MainLayout>
    );
};

export default Dashboard;
