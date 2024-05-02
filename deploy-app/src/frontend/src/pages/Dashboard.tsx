import { useContext, useEffect, useState } from "react";
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Paper,
  Chip,
  CircularProgress,
  Button,
} from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import { GitService } from "../services/git.service";
import BasicTableWithActions from "../components/BasicTableWithActions";
import DeployButton from "../components/DeployButton";
import GlobalContext from "../contexts/GlobalContext";
import RefreshIcon from "@mui/icons-material/Refresh";
import CommitIcon from "@mui/icons-material/Commit";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import ChangeListDialog from "../components/ChangeListDialog";

export interface TagDataDTO {
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

const environmentsForVersions = (
  version: string,
  envs: EnvInfo[]
): string[] => {
  return envs.filter((env) => env.version === version).map((env) => env.name);
  // .join(', ');
};

const Dashboard = () => {
  
  const [loading, setLoading] = useState(false);
  const [dashboardState, setDashboardState] = useState<{
    config: GetConfigsDto[];
    versionData: ConfigApplicationDto;
    selectedEnv: EnvInfo[];
    tableRows: K8STableRow[] | E2TableRow[];
  }>({
    config: [],
    versionData: {} as ConfigApplicationDto,
    selectedEnv: [],
    tableRows: [],
  });

  const [changeList, setChangeList] = useState<{
    [directory: string]: TagDataDTO[];
  }>({});
  const [openChangeListDialog, setOpenChangeListDialog] = useState(false);

  const { addSnackBar, addAlertDialog, getLastKnownSelectedTab, updateLastKnownSelectedTab } = useContext(GlobalContext);

  // try to obtain the last known selected tab from the global context, default to 0
  const [selectedTab, setSelectedTab] = useState(getLastKnownSelectedTab && getLastKnownSelectedTab() || 0);

  const k8sTableColumns = [
    { label: "Version", field: "version" },
    {
      label: "Summary",
      field: "summary",
      style: { minWidth: "40%", maxWidth: "45%" },
    }, // using percentage
    {
      label: "Images",
      field: "images",
      renderer: (images: string) => (
        <Typography
          variant="body2"
          style={{ fontSize: "0.8rem", whiteSpace: "pre-line" }}
        >
          {images}
        </Typography>
      ),
      style: { maxWidth: "13em" }, // using em for images to ensure enough space
    },
    { label: "Assigned To", field: "assigned_to" },
  ];

  const e2TableColumns = [
    { label: "Version", field: "version" },
    {
      label: "Summary",
      field: "summary",
      style: { minWidth: "30%", maxWidth: "40%" },
    }, // using percentage
    { label: "Assigned To", field: "assigned_to" },
  ];

  const getRowsForApp = (
    appData: ConfigApplicationDto,
    envs: EnvInfo[],
    changes: { [directory: string]: TagDataDTO[] }
  ) => {
    const { versions, type } = appData;

    return Object.keys(versions).map((versionKey) => {
      const versionData = versions[versionKey];
      const assignedEnvironments = environmentsForVersions(versionKey, envs);
      const directory = dashboardState.config[selectedTab]?.directory_name;

      // Retrieve changes for the current directory
      const directoryChanges = changes[directory] || [];

      // Filter changes that match the current version
      const changeEnvironments = directoryChanges
        .filter((change) => change.tag === versionKey)
        .filter((change) => !assignedEnvironments.includes(change.environment))
        .map(
          (change) => `<span style="color: green;">${change.environment}</span>`
        );

      const assignedToFormatted = [
        ...assignedEnvironments,
        ...changeEnvironments,
      ].join(", ");

      if (type === "k8s") {
        return {
          version: versionKey,
          images: `${versionData.backend?.image || "N/A"}\n${
            versionData.frontend?.image || "N/A"
          }`,
          summary: versionData.summary || "No summary available",
          assigned_to: assignedToFormatted,
        };
      } else {
        return {
          version: versionKey,
          summary: versionData.summary || "No summary available",
          assigned_to: assignedToFormatted,
        };
      }
    });
  };

  // new state management functions
  const loadDataForTab = async (directoryName: string) => {
    setLoading(true);
    try {
      const configData = await gitService.getConfig(directoryName);
      // const releaseData = await gitService.getReleases(directoryName);
      const versionData = await gitService.getVersions(directoryName);
      const currentChanges = changeList || [];

      setDashboardState((prevState) => ({
        ...prevState,
        versionData: versionData.application,
        selectedEnv: configData.application.envs,
        tableRows: getRowsForApp(
          versionData.application,
          configData.application.envs,
          currentChanges
        ),
      }));
    } catch (error: Error | any) {
      let message = `Error: ${error.response?.data?.detail || error.message}`;
      if (addSnackBar) {
        addSnackBar({ message, type: "error", duration: 10000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshDataForTab = async () => {
    setLoading(true);
    try {
      const configData = await gitService.refreshConfig();
      setDashboardState((prevState) => ({
        ...prevState,
        config: configData,
      }));
    } catch (error: Error | any) {
      let message = `Error: ${error.response?.data?.detail || error.message}`;
      if (addSnackBar) {
        addSnackBar({ message, type: "error", duration: 10000 });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const lastKnonwSelectedTab = getLastKnownSelectedTab && getLastKnownSelectedTab() || 0;
    setSelectedTab(lastKnonwSelectedTab);

    gitService.getConfigs().then((data) => {
      setDashboardState((prevState) => ({
        ...prevState,
        config: data,
      }));

      if (data.length > 0) {
        loadDataForTab(data[lastKnonwSelectedTab].directory_name);
      }
    });
  }, []);

  useEffect(() => {
    if (dashboardState.config.length > 0) {
      const directoryName = dashboardState.config[selectedTab].directory_name;
      loadDataForTab(directoryName);
    }

    if (updateLastKnownSelectedTab) {
      updateLastKnownSelectedTab(selectedTab);
    }
  }, [selectedTab, dashboardState.config]);

  useEffect(() => {
    if (dashboardState.config.length > selectedTab) {
      const directory = dashboardState.config[selectedTab]?.directory_name;
      if (changeList[directory]?.length === 0) {
        setDashboardState((prevState) => ({
          ...prevState,
          tableRows: getRowsForApp(
            prevState.versionData,
            prevState.selectedEnv,
            changeList
          ),
        }));
        return;
      }

      gitService
        .checkPrecedenceForChangeList(changeList[directory])
        .then((response) => {
          console.log("Check precedence response", response);

          /**
                 * Example response:
                 * {
                        "success": false,
                        "message": [
                            {
                                "higher_env": "qa",
                                "current_version": "1.0.10",
                                "proposed_env": "preprod",
                                "proposed_version": "1.0.11",
                                "error": "Proposed version 1.0.11 for preprod is higher than qa's version 1.0.10"
                            },
                            {
                                "higher_env": "qa",
                                "current_version": "1.0.10",
                                "proposed_env": "prod",
                                "proposed_version": "1.0.11",
                                "error": "Proposed version 1.0.11 for prod is higher than qa's version 1.0.10"
                            }
                        ]
                    }
                }
                 */

          if (response.success == false) {
            const title = "Precedence Check Failed";
            const message = `The following errors were found in the change list:`;
            const bullets: string[] = [];

            response.message.forEach((item: any) => {
              bullets.push(`${item.error}`);
            });

            console.log("Precedence check failed", bullets);

            if (addAlertDialog) {
              addAlertDialog({ message, title, bullets });
            }

            // remove items that violate precedence from the changeList
            setChangeList((prevState) => {
              const currentList = prevState[directory] || [];
              const updatedList = currentList.filter((item) => {
                return response.message.some((error: any) => {
                  return item.environment !== error.proposed_env;
                });
              });

              return { ...prevState, [directory]: updatedList };
            });
          }
        })
        .catch((error) => {
          console.error("Check precedence error", error);
        });

      // Update the table rows with the new change list
      setDashboardState((prevState) => ({
        ...prevState,
        tableRows: getRowsForApp(
          prevState.versionData,
          prevState.selectedEnv,
          changeList
        ),
      }));
    }
  }, [changeList]);

  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
    // If needed, trigger data loading for the newly selected tab
    if (dashboardState.config.length > newValue) {
      loadDataForTab(dashboardState.config[newValue].directory_name);
    }
  };

  const k8sActionsColumn = (row: K8STableRow) => {
    const handleOnSelection = (
      env: string,
      fromVersion: string,
      toVersion: string
    ) => {
      // Access the directory name from the unified state object
      const directory = dashboardState.config[selectedTab]?.directory_name;

      const tagData = {
        tag: row.version,
        directory: directory,
        environment: env,
        fromVersion,
        toVersion,
      } as TagDataDTO;

      console.log(tagData);

      setChangeList((prevState) => {
        const directory = tagData.directory;
        const currentList = prevState[directory] || [];

        // Find and remove existing tag from list (if any)
        const existingTagIndex = currentList.findIndex(
          (item) => item.environment === tagData.environment
        );
        if (existingTagIndex !== -1) {
          currentList.splice(existingTagIndex, 1);
        }

        // Add new tag to the list
        currentList.push(tagData);

        return { ...prevState, [directory]: currentList };
      });

      // setLoading(true);
      // gitService.deployVersion(tagData).then(() => {
      //     let message = `Deployed ${row.version} to ${env}`;
      //     if (addSnackBar) {
      //         addSnackBar({ message, type: 'success', duration: 5000 });
      //     }

      //     // update the state by calling the loadDataForTab function
      //     loadDataForTab(directory);
      // }).catch((error) => {
      //     let message = `${error.response?.data?.detail || error.message}`;
      //     if (addAlertDialog) {
      //         addAlertDialog({ message, title: 'Error' });
      //     }
      // }).finally(() => {
      //     setLoading(false);
      // });
    };

    return (
      <DeployButton
        excludeEnvs={row.assigned_to.split(", ")}
        possibleVersion={row.version}
        currentVersions={dashboardState.selectedEnv}
        onSelection={handleOnSelection}
      />
    );
  };

  const enableCommitButton = () => {
    const directory = dashboardState.config[selectedTab]?.directory_name;
    return changeList[directory]?.length > 0;
  };

  const commitChanges = () => {
    setLoading(true);
    const directory = dashboardState.config[selectedTab]?.directory_name;
    const changes = changeList[directory] || [];

    if (changes.length === 0) {
      return;
    }

    gitService
      .commitChanges(changes)
      .then(() => {
        let message = "Changes committed successfully";
        if (addSnackBar) {
          addSnackBar({ message, type: "success", duration: 5000 });
        }
      })
      .catch((error) => {
        let message = `${error.response?.data?.detail || error.message}`;
        if (addAlertDialog) {
          addAlertDialog({ message, title: "Error" });
        }
      })
      .finally(() => {
        setLoading(false);
        // clear the change list
        setChangeList((prevState) => ({ ...prevState, [directory]: [] }));
        loadDataForTab(directory);
      });
  };

  const renderTabContent = (tabIndex: number) => {
    // Make sure to access the current state from `dashboardState`
    const currentConfig = dashboardState.config[tabIndex];
    if (!currentConfig) {
      return <Typography>Loading...</Typography>; // Or some other placeholder content
    }

    const rows = dashboardState.tableRows;
    const columns =
      currentConfig.application_type === "k8s"
        ? k8sTableColumns
        : e2TableColumns;

    return (
      <BasicTableWithActions
        keyColumn="version"
        columns={columns}
        rows={rows}
        actionColumn={k8sActionsColumn}
      />
    );
  };

  const renderChangeListDialog = () => {
    const directory = dashboardState.config[selectedTab]?.directory_name;
    const changes = changeList[directory] || [];

    return (
      <ChangeListDialog
        open={openChangeListDialog}
        title="Change List"
        changeList={changes}
        onConfirm={() => {
          setOpenChangeListDialog(false);
          commitChanges();
        }}
        onCancel={() => setOpenChangeListDialog(false)}
      />
    );
  };

  const clearChangeList = () => {
    const directory = dashboardState.config[selectedTab]?.directory_name;
    setChangeList((prevState) => ({ ...prevState, [directory]: [] }));
  };

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Tagger
          </Typography>
          <Button variant="contained" onClick={() => refreshDataForTab()}>
            <RefreshIcon /> Refresh
          </Button>
        </Box>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="dashboard scrollable auto tabs"
        >
          {dashboardState.config.map((item, index) => (
            <Tab key={index} label={item.application_name} />
          ))}
        </Tabs>
        <Box sx={{ mt: 2 }}>
          {/* Loading indicator */}
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="200px"
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  Environment Versions
                </Typography>
                {dashboardState.selectedEnv.map((env, index) => (
                  <Chip
                    key={index}
                    label={`${env.info} (${env.name}): ${env.version}`}
                    sx={{ m: 1 }}
                  />
                ))}
              </Paper>
              <Box display="flex" justifyContent="flex-end" sx={{ mb: 3 }}>
                <Button
                  disabled={!enableCommitButton()}
                  color="primary"
                  variant="contained"
                  onClick={() => {
                    clearChangeList();
                  }}
                  sx={{ mr: 3 }}
                >
                  <DeleteSweepIcon />
                  &nbsp;Clear changes
                </Button>
                <Button
                  disabled={!enableCommitButton()}
                  color="success"
                  variant="contained"
                  onClick={() => {
                    setOpenChangeListDialog((prev) => !prev);
                  }}
                >
                  <CommitIcon />
                  &nbsp;commit changes
                </Button>
              </Box>
              {renderTabContent(selectedTab)}
            </>
          )}
        </Box>
        {renderChangeListDialog()}
      </Container>
    </MainLayout>
  );
};

export default Dashboard;
