import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';

export const AppLayout = () => {
  return (
    <AppSidebar>
      <Outlet />
    </AppSidebar>
  );
};

export default AppLayout;
