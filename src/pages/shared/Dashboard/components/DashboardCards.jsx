import { Card, Flex, Row, Col, Progress } from 'antd'
import { ContainerOutlined, ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useState } from 'react'
import DelayModal from './DelayModal'
import ConsumptionModal from './ConsumptionModal'
import NotesModal from './NotesModal'
import styles from './DashboardCards.module.css'

export const dashboardCardsData = [
	{
		id: 1,
		title: 'مدت زمان آبیاری امروز',
		value: '8 ساعت و 52 دقیقه',
		icon: <ClockCircleOutlined className={styles.info} />,
		status: 'info',
	},
	{
		id: 2,
		title: 'میزان پیشرفت آبیاری امروز',
		value: 73,
		progress: true,
		status: 'success',
	},
	{
		id: 3,
		title: 'میزان پیشرفت آبیاری سایکل',
		value: 14,
		progress: true,
		status: 'warning',
	},
	{
		id: 4,
		title: 'تاخیر در شروع آبیاری امروز',
		value: '0',
		icon: <ExclamationCircleOutlined className={styles.error} />,
		status: 'error',
		clickable: true,
		modalType: 'delay',
	},
	{
		id: 5,
		title: 'مصرف خارج از برنامه',
		value: '4',
		icon: <ExclamationCircleOutlined className={styles.error} />,
		status: 'error',
		clickable: true,
		modalType: 'consumption',
	},
	{
		id: 6,
		title: 'یادداشت جدید',
		value: '5',
		icon: <ContainerOutlined className={styles.info} />,
		status: 'info',
		clickable: true,
		modalType: 'notes',
	},
]

const DashboardCard = ({ title, value, icon, progress, status, clickable, modalType, onCardClick, isSelected }) => {
	const getProgressColor = progressValue => {
		return progressValue >= 30 ? '#52c41a' : '#ff4d4f'
	}

	const getCardStyle = () => {
		if (isSelected && clickable) {
			const styleMap = {
				consumption: {
					borderColor: '#FF4D4F',
					backgroundColor: '#FFF6F6',
					cursor: 'pointer',
				},
				notes: {
					borderColor: '#0066EE',
					backgroundColor: '#F2F7FE',
					cursor: 'pointer',
				},
				delay: {
					borderColor: '#FF4D4F',
					backgroundColor: '#FFF6F6',
					cursor: 'pointer',
				},
			}
			return (
				styleMap[modalType] || {
					borderColor: '#FF4D4F',
					backgroundColor: '#FFF6F6',
					cursor: 'pointer',
				}
			)
		}
		return clickable ? { cursor: 'pointer' } : {}
	}

	const handleClick = () => {
		if (clickable && onCardClick) {
			onCardClick(modalType)
		}
	}

	return (
		<Card className={styles.card} style={getCardStyle()} onClick={handleClick}>
			<Flex vertical align='center' justify='center' gap={8}>
				<Flex align='center' gap={16}>
					<Flex align='center' justify='center' gap={8}>
						{icon && icon}
						{progress && <Progress type='circle' percent={value} strokeColor={getProgressColor(value)} showInfo={false} size={24} />}
						<h6 className={styles.title}>{progress ? `٪${value}` : value}</h6>
					</Flex>
				</Flex>
				<p className={styles.text}>{title}</p>
			</Flex>
		</Card>
	)
}

const DashboardCards = ({ data = dashboardCardsData }) => {
	const [modalState, setModalState] = useState({
		visible: false,
		type: null,
	})
	const [selectedCard, setSelectedCard] = useState(null)

	const handleCardClick = modalType => {
		setSelectedCard(modalType)
		setModalState({
			visible: true,
			type: modalType,
		})
	}

	const handleModalClose = () => {
		setModalState({
			visible: false,
			type: null,
		})
		setSelectedCard(null)
	}

	return (
		<>
			<Flex align='stretch' justify='space-between' gap={16} wrap>
				<Row gutter={[16, 16]} style={{ marginBottom: 24, width: '100%' }}>
					{data.map(cardData => (
						<Col xs={24} sm={12} md={8} key={cardData.id}>
							<DashboardCard {...cardData} onCardClick={handleCardClick} isSelected={selectedCard === cardData.modalType} />
						</Col>
					))}
				</Row>
			</Flex>

			<DelayModal visible={modalState.visible && modalState.type === 'delay'} onCancel={handleModalClose} />
			<ConsumptionModal visible={modalState.visible && modalState.type === 'consumption'} onCancel={handleModalClose} />
			<NotesModal visible={modalState.visible && modalState.type === 'notes'} onCancel={handleModalClose} />
		</>
	)
}

export default DashboardCards
