import { Outlet } from 'react-router-dom';
import MainSidebar from '../components/MainSidebar';
import '../styles/MainLayout.css';

const MainLayout = () => {
    return (
        <div className="main-layout">
            <MainSidebar />
            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;
