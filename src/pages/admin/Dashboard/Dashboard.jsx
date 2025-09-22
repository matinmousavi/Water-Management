import { Typography, Flex, Table, Tag, Input, Progress } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useRef, useState } from 'react'
import DashboardCards from './components/DashboardCards'
import styles from './Dashboard.module.css'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import DelayModal from './components/DelayModal'
import ConsumptionModal from './components/ConsumptionModal'
import NotesModal from './components/NotesModal'

const { Title } = Typography

const Dashboard = () => {
	const searchInput = useRef(null)
	const [modalState, setModalState] = useState({ visible: false, type: null })

	const api = useAPI()
	api.init('dashboard')

	const getColumnSearchProps = dataIndex => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
			<div style={{ padding: 8 }}>
				<Input
					ref={searchInput}
					placeholder={`جستجو در ${dataIndex === 'wellName' ? 'عنوان چاه' : 'زمین/گروه'}`}
					value={selectedKeys[0]}
					onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
					onPressEnter={() => confirm()}
					style={{ marginBottom: 8, display: 'block' }}
				/>
				<Flex gap={8} justify='space-between'>
					<a onClick={() => confirm()}>اعمال</a>
					<a
						onClick={() => {
							clearFilters()
							confirm()
						}}
					>
						پاک‌سازی
					</a>
				</Flex>
			</div>
		),
		filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
		onFilter: (value, record) => record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
		onFilterDropdownOpenChange: visible => {
			if (visible) setTimeout(() => searchInput.current?.select(), 100)
		},
	})

	const getStatusTag = status => {
		if (!status) return null
		const statusClassMap = {
			'در حال آبیاری': 'watering',
			تاخیر: 'delay',
			'توقف زودهنگام': 'earlyStop',
			'مصرف بیشتر': 'overConsumption',
			'خارج از زمانبندی': 'outOfSchedule',
		}
		return <Tag className={`${styles.tag} ${styles[statusClassMap[status]]}`}>{status}</Tag>
	}

	const columns = [
		{
			title: 'عنوان چاه',
			dataIndex: 'wellName',
			key: 'wellName',
			render: name => <Link>{name}</Link>,
			...getColumnSearchProps('wellName'),
		},
		{
			title: 'زمین/گروه',
			dataIndex: 'land',
			key: 'land',
			render: text => <Link>{text}</Link>,
			...getColumnSearchProps('land'),
		},
		{
			title: 'ساعت شروع آبیاری',
			dataIndex: 'startTime',
			key: 'startTime',
			render: (time, record) => (
				<Flex align='center' gap={8}>
					{time}
					{record.status === 'تاخیر' && getStatusTag('تاخیر')}
				</Flex>
			),
		},
		{
			title: 'ساعت پایان آبیاری',
			dataIndex: 'endTime',
			key: 'endTime',
			render: (time, record) => {
				if (['توقف زودهنگام', 'مصرف بیشتر', 'در حال آبیاری'].includes(record.status)) {
					if (record.status === 'در حال آبیاری') return getStatusTag(record.status)
					return (
						<Flex align='center' gap={8}>
							<div>{time}</div>
							{getStatusTag(record.status)}
						</Flex>
					)
				}
				return time
			},
		},
		{
			title: 'وضعیت دریافت آب',
			dataIndex: 'waterStatus',
			key: 'waterStatus',
			render: value => <Progress percent={value} size='small' strokeColor={value === 100 ? '#52c41a' : value > 50 ? '#FFC916' : '#f5222d'} />,
		},
	]

	if (!api.data) return <Loading />

	const wellsData = (api.data?.wells || []).map(item => ({
		...item,
		land: item.land ? item.land.title || item.land.id : item.group ? item.group.title || item.group.id : '---',
	}))

	const delayedLogs = wellsData.filter(w => w.status === 'تاخیر')
	const outOfScheduleLogs = wellsData.filter(w => w.status === 'خارج از زمانبندی')

	const cardsData = {
		totalIrrigatedMinutes: api.data?.totalIrrigatedMinutes ?? 0,
		progressPercent: api.data?.progressPercent ?? 0,
		delayedStartCount: delayedLogs.length,
		outOfScheduleCount: outOfScheduleLogs.length,
		totalScheduledMinutes: api.data?.totalScheduledMinutes ?? 0,
		unreadNotesCount: api.data?.unreadNotesCount ?? 0,
	}

	return (
		<Flex vertical gap={40}>
			<Flex vertical gap={24}>
				<Title level={1} className={`text-h1 ${styles.title}`}>
					داشبورد
				</Title>
				<DashboardCards data={cardsData} onOpenModal={setModalState} />
			</Flex>

			<Flex vertical gap={24}>
				<Title level={1} className={`text-h1 ${styles.title}`}>
					وضعیت آبیاری امروز
				</Title>
				<Table
					dataSource={wellsData}
					columns={columns}
					rowKey={record => record.key}
					locale={{ emptyText: 'داده‌ای موجود نیست' }}
					bordered
					scroll={{ x: 'max-content' }}
				/>
			</Flex>

			<DelayModal
				visible={modalState.visible && modalState.type === 'delay'}
				onCancel={() => setModalState({ visible: false, type: null })}
				data={delayedLogs}
			/>
			<ConsumptionModal
				visible={modalState.visible && modalState.type === 'consumption'}
				onCancel={() => setModalState({ visible: false, type: null })}
				data={outOfScheduleLogs}
			/>
			<NotesModal visible={modalState.visible && modalState.type === 'notes'} onCancel={() => setModalState({ visible: false, type: null })} />
		</Flex>
	)
}

export default Dashboard
