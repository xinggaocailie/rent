import { useMemo, useState } from 'react';
import {
  HomeOutlined,
  LoginOutlined,
  LogoutOutlined,
  SearchOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Avatar, Button, Form, Input, Modal, Space, Tag, Typography } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Text, Title } = Typography;

function AppHeader() {
  const location = useLocation();
  const { user, isLoggedIn, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<{ username: string; password: string }>();

  const activePath = useMemo(() => {
    if (location.pathname.startsWith('/find')) {
      return '/find';
    }
    if (location.pathname.startsWith('/houses/')) {
      return '/find';
    }
    return '/';
  }, [location.pathname]);

  const onLogin = async () => {
    const values = await form.validateFields();
    try {
      setSubmitting(true);
      await login(values.username, values.password);
      setOpen(false);
      form.resetFields();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to="/" className="brand-link">
          <Space size={10} align="center">
            <Avatar shape="square" size={38} className="brand-avatar" icon={<HomeOutlined />} />
            <div>
              <Title level={4} className="brand-title">
                安居租房
              </Title>
              <Text className="brand-subtitle">真实房源 · 在线签约 · 省心租住</Text>
            </div>
          </Space>
        </Link>

        <Space size={12} className="nav-links">
          <Link className={activePath === '/' ? 'nav-link active' : 'nav-link'} to="/">
            首页
          </Link>
          <Link className={activePath === '/find' ? 'nav-link active' : 'nav-link'} to="/find">
            找房
          </Link>
        </Space>

        {isLoggedIn ? (
          <Space size={10} className="user-area" wrap>
            <Tag className="user-tag" icon={<UserOutlined />}>
              你好，{user?.name}
            </Tag>
            <Button icon={<LogoutOutlined />} onClick={logout}>
              退出
            </Button>
          </Space>
        ) : (
          <Button type="primary" icon={<LoginOutlined />} onClick={() => setOpen(true)}>
            登录
          </Button>
        )}
      </div>

      <Modal
        title="登录 rent-server"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void onLogin()}
        okText="登录"
        confirmLoading={submitting}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ username: 'alice', password: '123456' }}
          autoComplete="off"
        >
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="例如：admin / alice / bob" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<SearchOutlined />} placeholder="默认密码 123456" />
          </Form.Item>
          <Text type="secondary">测试账号：admin / alice / bob，密码均为 123456</Text>
        </Form>
      </Modal>
    </header>
  );
}

export default AppHeader;
