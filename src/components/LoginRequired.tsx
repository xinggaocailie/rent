import { LockOutlined } from '@ant-design/icons';
import { Alert, Space, Typography } from 'antd';

const { Text } = Typography;

function LoginRequired() {
  return (
    <Alert
      type="info"
      showIcon
      icon={<LockOutlined />}
      message="请先登录 rent-server"
      description={
        <Space direction="vertical" size={0}>
          <Text>点击右上角“登录”，使用测试账号：admin / alice / bob</Text>
          <Text type="secondary">默认密码均为 123456</Text>
        </Space>
      }
    />
  );
}

export default LoginRequired;
