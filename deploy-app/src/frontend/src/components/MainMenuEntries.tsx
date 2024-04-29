import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';


const MainMenuEntries = [
    {
        title: 'Tagger',
        icon: <DashboardIcon />,
        path: '/dashboard',
        guard: null
    },
    {
        title: 'Users',
        icon: <PeopleIcon />,
        path: '/users',
        guard: 'admin'
    },
    {
        title: 'Profile',
        icon: <PersonIcon />,
        path: '/users/me',
        guard: null
    }
];

export default MainMenuEntries;