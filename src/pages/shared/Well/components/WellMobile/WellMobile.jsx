import { useState } from 'react'
import { Typography, Flex, Tabs, Empty, Button } from 'antd'
import { CaretDownOutlined, CaretUpOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import moment from 'moment-jalaali'
import { convertEnglishDigitsToPersian } from '../../../../../utils/stringUtils'

import WellsList from './components/WellsList/WellsList'
import WellLogsMobile from './components/WellLogsMobile/WellLogsMobile'
import WellNotesMobile from './components/WellNotesMobile/WellNotesMobile'
import useAPI from '../../../../../hooks/useAPI'
import Loading from '../../../../../components/common/Loading/Loading'

import styles from './WellMobile.module.css'

const WellMobile = ({ irrigatorWells, setIrrigatorWells, filterWells }) => {
	const [openWellList, setOpenWellList] = useState(false)
	const schedulesApi = useAPI()
	const schedules = schedulesApi?.data?.schedules
	const [date, setDate] = useState(moment())

	const fetchSchedules = async selectedDate => {
		try {
			const isoDate = selectedDate.startOf('day').toISOString()
			await schedulesApi.get(`wells/${irrigatorWells?._id}/schedules/day/${isoDate}`)
		} catch (err) {
			console.error('خطا در دریافت زمان‌بندی:', err)
		}
	}

	if (!schedules && irrigatorWells?._id) {
		fetchSchedules(date)
	}

	const goNextDay = async () => {
		const newDate = moment(date).add(1, 'day')
		setDate(newDate)
		await fetchSchedules(newDate)
	}

	const goPrevDay = async () => {
		const newDate = moment(date).subtract(1, 'day')
		setDate(newDate)
		await fetchSchedules(newDate)
	}

	const renderLabel = d => {
		const today = moment().startOf('day')
		const target = moment(d).startOf('day')

		const dayNum = convertEnglishDigitsToPersian(target.jDate())
		const monthName = target.format('jMMMM')

		let suffix = ''
		if (target.isSame(today, 'day')) suffix = ' (امروز)'
		else if (target.isSame(moment(today).subtract(1, 'day'), 'day')) suffix = ' (دیروز)'
		else if (target.isSame(moment(today).add(1, 'day'), 'day')) suffix = ' (فردا)'

		return `${dayNum} ${monthName}${suffix}`
	}

	const onCloseWellList = () => setOpenWellList(false)

	const handleWellSelect = async well => {
		setIrrigatorWells(well)
		onCloseWellList()
		await fetchSchedules(date)
	}

	return filterWells?.length === 0 ? (
		<Flex style={{ height: '100vh' }} justify='center' align='center'>
			<Empty description='چاهی به شما داده نشده است' />
		</Flex>
	) : (
		<>
			<Flex style={{ position: 'relative' }} gap={8} justify='center' align='center'>
				<img src='/assets/icons/Vector.svg' alt='icon' />
				<Typography.Title level={2} className='text-h2'>
					چاه {irrigatorWells?.title || irrigatorWells?._id}
				</Typography.Title>
				{filterWells?.length <= 1 ? null : openWellList ? (
					<CaretUpOutlined onClick={() => setOpenWellList(false)} style={{ color: '#00000073' }} />
				) : (
					<CaretDownOutlined onClick={() => setOpenWellList(true)} style={{ color: '#00000073' }} />
				)}
				<WellsList setData={handleWellSelect} data={filterWells} onClose={onCloseWellList} open={openWellList} />
			</Flex>

			{schedulesApi.isLoading ? (
				<Loading />
			) : (
				<Tabs
					defaultActiveKey='logs'
					items={[
						{
							key: 'logs',
							label: 'نوبت آبیاری',
							children: (
								<>
									<Flex vertical gap={16}>
										{schedules?.length > 0 ? (
											schedules.map(log => <WellLogsMobile wellId={irrigatorWells?._id} key={log?._id || log.id} data={log} />)
										) : (
											<Empty />
										)}
									</Flex>
									{schedules?.length >= 0 && (
										<div className={styles.datePager} dir='rtl'>
											<Button type='link' onClick={goPrevDay} className={styles.btn}>
												<span>
													<RightOutlined />
												</span>
												<span>روز قبل</span>
											</Button>

											<div className={styles.date}>{renderLabel(date)}</div>

											<Button type='link' onClick={goNextDay} className={styles.btn}>
												<span>روز بعد</span>
												<span>
													<LeftOutlined />
												</span>
											</Button>
										</div>
									)}
								</>
							),
						},
						{
							key: 'notes',
							label: 'یادداشت‌ها',
							children: <WellNotesMobile wellId={irrigatorWells?._id} />,
						},
					]}
				/>
			)}
		</>
	)
}

export default WellMobile
