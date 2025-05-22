import { Button, Card, Col, Flex, Row, Typography } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import styles from './Land.module.css'
import useAPI from '../../../hooks/useAPI'
import { useParams } from 'react-router'

const { Text, Title } = Typography

const mockLand = {
  land: {
    _id: 'land123',
    name: 'زمین تستی',
    owner: {
      _id: 'user1',
      name: 'علی رضایی',
      email: 'ali@example.com',
    },
    area: 400,
    kFactor: 1.1,
    location: 'تهران',
    irrigationType: 'بارانی',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-05T00:00:00.000Z',
    wells: [{ _id: 'well1', name: 'چاه شماره ۱' }],
  },
}

const Land = () => {
  const { landId } = useParams()
  const useMock = true

  const landApi = useAPI()
  if (!useMock) landApi.init(`lands/${landId}`)
  const { data, isLoading } = landApi

  const landData = useMock ? mockLand : data
  const { land } = landData

  const handleOpenModal = () => {
    console.log('ویرایش کلیک شد')
  }

  if (!land || isLoading) return <p>در حال بارگذاری...</p>

  const landInfoList = [
    { label: 'نام زمین', value: land.name },
    { label: 'مالک', value: land.owner?.name },
    { label: 'متراژ', value: `${land.area} متر مربع` },
    { label: 'ضریب k', value: land.kFactor },
    { label: 'موقعیت', value: land.location || '-' },
    { label: 'نوع آبیاری', value: land.irrigationType },
    { label: 'تعداد چاه‌ها', value: `${land.wells?.length || 0}` },
  ]

  return (
    <Card className={styles.card}>
      <Flex align='center' justify='space-between'>
        <Title level={2} className='text-h2'>
          مشخصات زمین
        </Title>
        <Button type='default' shape='round' icon={<EditOutlined />} size='middle' onClick={handleOpenModal}>
          <span>ویرایش</span>
        </Button>
      </Flex>

      <div className={styles.infoWrapper}>
        <Row gutter={[0, 8]}>
          {landInfoList.map((item, index) => (
            <Col key={index} xs={24} md={20} lg={18} className={styles.line}>
              <Row>
                <Col xs={10}>
                  <Text className='text-label'>{item.label}</Text>
                </Col>
                <Col xs={14}>
                  <Text className='text-label'>{item.value}</Text>
                </Col>
              </Row>
            </Col>
          ))}
        </Row>
      </div>
    </Card>
  )
}

export default Land
