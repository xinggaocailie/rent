import { useEffect, useMemo, useState } from 'react';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Empty,
  Result,
  Space,
  Spin,
  Tag,
  Typography,
  message
} from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { listHouses, rentHouse } from '../api/rentService';
import LoginRequired from '../components/LoginRequired';
import { useAuth } from '../contexts/AuthContext';
import type { House } from '../types/rent';

const { Paragraph, Text, Title } = Typography;

function HouseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [house, setHouse] = useState<House | null>(null);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);

  const numericId = useMemo(() => Number(id), [id]);

  const loadDetail = async () => {
    if (!isLoggedIn || Number.isNaN(numericId)) {
      setHouse(null);
      return;
    }

    try {
      setLoading(true);
      const data = await listHouses();
      const current = data.list.find((item) => item.id === numericId) ?? null;
      setHouse(current);
    } catch (error) {
      const msg = error instanceof Error ? error.message : '获取房源详情失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDetail();
  }, [isLoggedIn, numericId]);

  const onRent = async () => {
    if (!house) {
      return;
    }
    if (!range) {
      message.warning('请选择租赁起止日期');
      return;
    }
    try {
      setSubmitting(true);
      await rentHouse(house.id, range[0].format('YYYY-MM-DD'), range[1].format('YYYY-MM-DD'));
      message.success('租赁成功，房源状态已更新为已出租');
      await loadDetail();
    } catch (error) {
      const msg = error instanceof Error ? error.message : '租赁失败';
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return <LoginRequired />;
  }

  if (Number.isNaN(numericId)) {
    return <Result status="warning" title="房源ID无效" extra={<Link to="/find">返回找房页</Link>} />;
  }

  return (
    <Card className="section-card" bordered={false}>
      {loading ? (
        <div className="center-box">
          <Spin />
        </div>
      ) : !house ? (
        <Empty description="未找到该房源" />
      ) : (
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <div className="detail-hero">
            <Space align="center" wrap>
              <Title level={3} style={{ margin: 0 }}>
                {house.title}
              </Title>
              <Tag color={house.status === 'available' ? 'success' : 'default'}>
                {house.status === 'available' ? '可租' : '已出租'}
              </Tag>
            </Space>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              房源ID：{house.id}
            </Paragraph>
          </div>

          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="城市">{house.city}</Descriptions.Item>
            <Descriptions.Item label="区域">{house.district}</Descriptions.Item>
            <Descriptions.Item label="面积">{house.area} m²</Descriptions.Item>
            <Descriptions.Item label="地址" span={2}>
              <Space size={6}>
                <EnvironmentOutlined />
                <span>{house.address}</span>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="月租">
              <Text className="house-price">¥{house.price}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={3}>
              {house.description || '暂无描述'}
            </Descriptions.Item>
          </Descriptions>

          <Card size="small" className="rent-card" title="在线租赁" extra={<HomeOutlined />}>
            {house.status === 'rented' ? (
              <Result status="info" title="该房源已出租" subTitle="你可以返回找房页继续浏览其他房源" />
            ) : (
              <Space direction="vertical" size={14} style={{ width: '100%' }}>
                <Space wrap>
                  <Tag icon={<SafetyCertificateOutlined />} color="processing">
                    合同在线签署
                  </Tag>
                  <Tag icon={<ClockCircleOutlined />} color="purple">
                    租后服务可追踪
                  </Tag>
                </Space>
                <Text>请选择租赁日期范围后提交：</Text>
                <DatePicker.RangePicker
                  value={range}
                  onChange={(values) => setRange(values as [Dayjs, Dayjs] | null)}
                  disabledDate={(current) => current.isBefore(dayjs().startOf('day'))}
                  style={{ width: '100%' }}
                  suffixIcon={<CalendarOutlined />}
                />
                <Space>
                  <Button type="primary" onClick={() => void onRent()} loading={submitting}>
                    提交租赁
                  </Button>
                  <Button onClick={() => navigate('/find')}>返回找房</Button>
                </Space>
              </Space>
            )}
          </Card>
        </Space>
      )}
    </Card>
  );
}

export default HouseDetailPage;
