import { Card, Flex, Row, Col, Progress } from 'antd'
import { ContainerOutlined, ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useState } from 'react'
import styles from './DashboardCards.module.css'

const DashboardCard = ({ title, value, icon, progress, clickable, modalType, onCardClick }) => {
	return (
		<Card
			className={`${styles.card} ${clickable ? styles[`hover-${modalType}`] : ''}`}
			style={clickable ? { cursor: 'pointer' } : {}}
			onClick={() => clickable && onCardClick?.(modalType)}
		>
			<Flex vertical align='center' justify='center' gap={8}>
				<Flex align='center' gap={16}>
					<Flex align='center' justify='center' gap={8}>
						{icon}
						{progress && <Progress type='circle' percent={value} strokeColor={value >= 30 ? '#52c41a' : '#ff4d4f'} showInfo={false} size={24} />}
						<h6 className={styles.title}>{progress ? `٪${value}` : value}</h6>
					</Flex>
				</Flex>
				<p className={styles.text}>{title}</p>
			</Flex>
		</Card>
	)
}

const DashboardCards = ({ data, onOpenModal }) => {
	const hours = Math.floor((data?.totalIrrigatedMinutes ?? 0) / 60)
	const minutes = (data?.totalIrrigatedMinutes ?? 0) % 60
	const [selectedCard, setSelectedCard] = useState(null)

	const handleCardClick = modalType => {
		setSelectedCard(modalType)
		onOpenModal({ visible: true, type: modalType })
	}

	const cards = [
		{
			id: 1,
			title: 'مدت زمان آبیاری امروز',
			value: `${hours > 0 ? `${hours} ساعت و ` : ''}${minutes} دقیقه`,
			icon: <ClockCircleOutlined className={styles.info} />,
			status: 'info',
		},
		{
			id: 2,
			title: 'میزان پیشرفت آبیاری امروز',
			value: data?.progressPercent ?? 0,
			progress: true,
			status: 'success',
		},
		{
			id: 3,
			title: 'میزان پیشرفت آبیاری سایکل',
			value: data?.totalScheduledMinutes ? Math.round(((data?.totalIrrigatedMinutes ?? 0) / data.totalScheduledMinutes) * 100) : 0,
			progress: true,
			status: 'warning',
		},
		{
			id: 4,
			title: 'تاخیر در شروع آبیاری امروز',
			value: data?.delayedStartCount ?? 0,
			icon: <ExclamationCircleOutlined className={styles.error} />,
			status: 'error',
			clickable: true,
			modalType: 'delay',
		},
		{
			id: 5,
			title: 'مصرف خارج از برنامه',
			value: data?.outOfScheduleCount ?? 0,
			icon: <ExclamationCircleOutlined className={styles.error} />,
			status: 'error',
			clickable: true,
			modalType: 'consumption',
		},
		{
			id: 6,
			title: 'یادداشت جدید',
			value: data?.unreadNotesCount ?? 0,
			icon: <ContainerOutlined className={styles.info} />,
			status: 'info',
			clickable: true,
			modalType: 'notes',
		},
	]

	return (
		<Flex align='stretch' justify='space-between' gap={16} wrap>
			<Row gutter={[16, 16]} style={{ marginBottom: 24, width: '100%' }}>
				{cards.map(cardData => (
					<Col xs={24} sm={12} md={8} key={cardData.id}>
						<DashboardCard {...cardData} onCardClick={handleCardClick} isSelected={selectedCard === cardData.modalType} />
					</Col>
				))}
			</Row>
		</Flex>
	)
}

export default DashboardCards
