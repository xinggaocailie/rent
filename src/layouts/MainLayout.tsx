import { Outlet } from 'react-router-dom';
import { Layout, Typography } from 'antd';
import AppHeader from '../components/AppHeader';

const { Content, Footer } = Layout;
const { Text } = Typography;

function MainLayout() {
  return (
    <Layout className="layout-root">
      <AppHeader />
      <Content className="content">
        <Outlet />
      </Content>
      <Footer className="footer">
        <Text type="secondary">© {new Date().getFullYear()} 安居租房 | 让租房更简单、更安心</Text>
      </Footer>
    </Layout>
  );
}

export default MainLayout;
