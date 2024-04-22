import { useContext, useEffect, useState } from 'react';
import { Container, Typography, Tabs, Tab, Box, Paper, Chip, CircularProgress, Button } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import { GitService } from '../services/git.service';
import BasicTableWithActions from '../components/BasicTableWithActions';
import DeployButton from '../components/DeployButton';
import GlobalContext from '../contexts/GlobalContext';
import RefreshIcon from '@mui/icons-material/Refresh';

interface TagDataDTO {
    tag: string;
    directory: string;
    environment: string;
    fromVersion?: string;
    toVersion?: string;
}

interface K8STableRow {
    version: string;
    backend_image: string;
    frontend_image: string;
    summary: string;
    assigned_to: string;
}

interface E2TableRow {
    version: string;
    summary: string;
    assigned_to: string;
}

interface GetConfigsDto {
    directory_name: string;
    application_name: string;
    application_type: string;
}

interface ConfigApplicationVersionDetailDto {
    image: string;
}

interface ConfigApplicationVersionDto {
    backend: ConfigApplicationVersionDetailDto;
    frontend: ConfigApplicationVersionDetailDto;
    summary: string;
}

interface ConfigApplicationVersionsDto {
    [key: string]: ConfigApplicationVersionDto;
}

// interface ConfigApplicationEnvsDto {
//     [key: string]: string;
// }

interface EnvInfo {
    info: string;
    name: string;
    version: string;
}

interface ConfigApplicationDto {
    name: string;
    type: string;
    envs: EnvInfo[];
    versions: ConfigApplicationVersionsDto;
}

const gitService = new GitService();

// const getRowsForApp = (appData: ConfigApplicationDto, envs: ConfigApplicationEnvsDto) => {
//     const { versions, type } = appData;

//     if (type === 'k8s') {
//         return Object.keys(versions).map(version => ({
//             version,
//             images: `${versions[version].backend?.image || 'N/A'}\n${versions[version].frontend?.image || 'N/A'}`,
//             summary: versions[version].summary || 'No summary available',
//             assigned_to: environmentsForVersions(version, envs) || '',
//         }));
//     } else {
//         return Object.keys(versions).map(version => ({
//             version,
//             summary: versions[version].summary || 'No summary available',
//             assigned_to: environmentsForVersions(version, envs) || '',
//         }));
//     }
// };

const getRowsForApp = (appData: ConfigApplicationDto, envs: EnvInfo[]) => {
    const { versions, type } = appData;

    if (type === 'k8s') {
        return Object.keys(versions).map(version => ({
            version,
            images: `${versions[version].backend?.image || 'N/A'}\n${versions[version].frontend?.image || 'N/A'}`,
            summary: versions[version].summary || 'No summary available',
            assigned_to: environmentsForVersions(version, envs) || '',
        }));
    } else {
        return Object.keys(versions).map(version => ({
            version,
            summary: versions[version].summary || 'No summary available',
            assigned_to: environmentsForVersions(version, envs) || '',
        }));
    }
};

const environmentsForVersions = (version: string, envs: EnvInfo[]): string => {
    return envs
        .filter(env => env.version === version)
        .map(env => env.name)
        .join(', ');
};

const Dashboard = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [dashboardState, setDashboardState] = useState<{
        config: GetConfigsDto[],
        selectedEnv: EnvInfo[],
        tableRows: (K8STableRow[] | E2TableRow[])
    }>({
        config: [],
        selectedEnv: [],
        tableRows: []
    });

    const { addSnackBar, addAlertDialog } = useContext(GlobalContext);

    const k8sTableColumns = [
        { label: 'Version', field: 'version' },
        { label: 'Summary', field: 'summary', style: { minWidth: '40%', maxWidth: '45%' } },  // using percentage
        { 
            label: 'Images', 
            field: 'images', 
            renderer: (images: string) => (
                <Typography variant="body2" style={{ fontSize: '0.8rem', whiteSpace: 'pre-line' }}>
                    {images}
                </Typography>
            ),
            style: { maxWidth: '13em' } // using em for images to ensure enough space
        },
        { label: 'Assigned To', field: 'assigned_to' },
    ];

    const e2TableColumns = [
        {label: 'Version', field: 'version'}, 
        { label: 'Summary', field: 'summary', style: { minWidth: '30%', maxWidth: '40%' } },  // using percentage
        {label: 'Assigned To', field: 'assigned_to'},
    ];

    // new state management functions
    const loadDataForTab = async (directoryName: string) => {
        setLoading(true);
        try {
            const configData = await gitService.getConfig(directoryName);
            // const releaseData = await gitService.getReleases(directoryName);
            const versionData = await gitService.getVersions(directoryName);
            setDashboardState(prevState => ({
                ...prevState,
                selectedEnv: configData.application.envs,
                tableRows: getRowsForApp(versionData.application, configData.application.envs)
            }));
        } catch (error: Error|any) {
            let message = `Error: ${error.response?.data?.detail || error.message}`;
            if (addSnackBar) {
                addSnackBar({ message, type: 'error', duration: 10000 });
            }
        } finally {
            setLoading(false);
        }
    };

    const refreshDataForTab = async () => {
        setLoading(true);
        try {
            const configData = await gitService.refreshConfig();
            setDashboardState(prevState => ({
                ...prevState,
                config: configData,
            }));
        } catch (error: Error|any) {
            let message = `Error: ${error.response?.data?.detail || error.message}`;
            if (addSnackBar) {
                addSnackBar({ message, type: 'error', duration: 10000 });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        gitService.getConfigs().then(data => {
            setDashboardState(prevState => ({
                ...prevState,
                config: data
            }));

            if (data.length > 0) {
                loadDataForTab(data[0].directory_name);
            }
        });
    }, []);


    useEffect(() => {
        if (dashboardState.config.length > 0) {
            const directoryName = dashboardState.config[selectedTab].directory_name;
            loadDataForTab(directoryName);
        }
    }, [selectedTab, dashboardState.config]);

    const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
        setSelectedTab(newValue);
        // If needed, trigger data loading for the newly selected tab
        if (dashboardState.config.length > newValue) {
            loadDataForTab(dashboardState.config[newValue].directory_name);
        }
    };

    const k8sActionsColumn = (row: K8STableRow) => {
        const handleOnSelection = (env: string, fromVersion: string, toVersion: string) => {
            // Access the directory name from the unified state object
            const directory = dashboardState.config[selectedTab]?.directory_name;
    
            const tagData = {
                tag: row.version,
                directory: directory,
                environment: env,
                fromVersion,
                toVersion
            } as TagDataDTO;
            
            setLoading(true);
            gitService.deployVersion(tagData).then(() => {
                let message = `Deployed ${row.version} to ${env}`;
                if (addSnackBar) {
                    addSnackBar({ message, type: 'success', duration: 5000 });
                }

                // update the state by calling the loadDataForTab function
                loadDataForTab(directory);
            }).catch((error) => {
                let message = `${error.response?.data?.detail || error.message}`;
                if (addAlertDialog) {
                    addAlertDialog({ message, title: 'Error' });
                }
            }).finally(() => {
                setLoading(false);
            });
        };
    
        return <DeployButton 
            possibleVersion={row.version} 
            currentVersions={dashboardState.selectedEnv} 
            onSelection={handleOnSelection} />;
    };

    const renderTabContent = (tabIndex: number) => {
        // Make sure to access the current state from `dashboardState`
        const currentConfig = dashboardState.config[tabIndex];
        if (!currentConfig) {
            return <Typography>Loading...</Typography>; // Or some other placeholder content
        }
    
        const rows = dashboardState.tableRows;
        const columns = currentConfig.application_type === 'k8s' ? k8sTableColumns : e2TableColumns;
    
        return <BasicTableWithActions keyColumn='version' columns={columns} rows={rows} actionColumn={k8sActionsColumn} />;
    };

    return (
        <MainLayout>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Tagger
                    </Typography>
                    <Button variant="contained" onClick={() => refreshDataForTab()}><RefreshIcon /> Refresh</Button>
                </Box>
                <Tabs value={selectedTab} onChange={handleTabChange} aria-label="dashboard tabs">
                    {dashboardState.config.map((item, index) => (
                        <Tab key={index} label={item.application_name} />
                    ))}
                </Tabs>
                <Box sx={{ mt: 2 }}>
                    {/* Loading indicator */}
                    {loading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Paper sx={{ p: 2, mb: 3 }}>
                                    <Typography variant="h6" component="h2" gutterBottom>
                                        Environment Versions
                                    </Typography>
                                    {dashboardState.selectedEnv.map((env, index) => (
                                        <Chip key={index} label={`${env.info} (${env.name}): ${env.version}`} sx={{ m: 1 }} />
                                    ))}
                                </Paper>
                                {renderTabContent(selectedTab)}
                            </>
                        )}
                </Box>
            </Container>
        </MainLayout>
    );
};

export default Dashboard;
