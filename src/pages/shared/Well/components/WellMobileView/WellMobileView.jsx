import { useState, useEffect } from 'react'
import { Typography, Flex, Tabs, Empty, Pagination, Button } from 'antd'
import { ArrowRightOutlined, CaretDownOutlined, CaretUpOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Link, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/fa'
import english2persian from '../../../../../utils/english2persian'

import WellsList from './components/WellsList/WellsList'
import WellLogsMobile from './components/WellLogsMobile/WellLogsMobile'
import WellNotesMobile from './components/WellNotesMobile/WellNotesMobile'
import useAPI from '../../../../../hooks/useAPI'
import Loading from '../../../../../components/Loading/Loading'

import styles from './WellMobileView.module.css'

dayjs.locale('fa')

const WellMobileView = ({ irrigatorWells, setIrrigatorWells, filterWells }) => {
	const [openWellList, setOpenWellList] = useState(false)
	const [searchParams, setSearchParams] = useSearchParams()
	const schedulesApi = useAPI()
	const schedules = schedulesApi?.data?.schedules

	console.log(schedules)

	const [date, setDate] = useState(dayjs())

	const goNextDay = () => setDate(d => d.add(1, 'day'))
	const goPrevDay = () => setDate(d => d.subtract(1, 'day'))

	const renderLabel = d => {
		const today = dayjs().startOf('day')
		const target = d.startOf('day')

		const dayNum = english2persian(String(target.date()))
		const monthName = target.format('MMMM')

		let suffix = ''
		if (target.isSame(today, 'day')) suffix = ' (امروز)'
		else if (target.isSame(today.subtract(1, 'day'), 'day')) suffix = ' (دیروز)'
		else if (target.isSame(today.add(1, 'day'), 'day')) suffix = ' (فردا)'

		return `${dayNum} ${monthName}${suffix}`
	}

	const wellIdFromParams = searchParams.get('wellId')

	useEffect(() => {
		if (!wellIdFromParams && filterWells?.length > 0) {
			const firstWell = filterWells[0]
			setSearchParams(prev => {
				const params = new URLSearchParams(prev)
				params.set('wellId', firstWell._id)
				return params
			})
			setIrrigatorWells(firstWell)
		}
	}, [wellIdFromParams, filterWells])

	useEffect(() => {
		const id = irrigatorWells?._id || wellIdFromParams
		if (id) {
			schedulesApi.init(`wells/${id}/schedules/today`)
			setIrrigatorWells(prev => (prev?._id === id ? prev : { _id: id }))
		}
	}, [irrigatorWells?._id, wellIdFromParams])

	const onCloseWellList = () => setOpenWellList(false)

	const handleWellSelect = well => {
		setIrrigatorWells(well)
		setSearchParams(prev => {
			const params = new URLSearchParams(prev)
			params.set('wellId', well._id)
			return params
		})
		onCloseWellList()
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
					چاه {irrigatorWells?.title || wellIdFromParams}
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
											schedules.map(log => (
												<WellLogsMobile wellId={irrigatorWells?._id || wellIdFromParams} key={log?._id || log.id} data={log} />
											))
										) : (
											<Empty />
										)}
									</Flex>
									{/* {schedules?.length > 0 && ( */}
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
									{/* )} */}
								</>
							),
						},
						{
							key: 'notes',
							label: 'یادداشت‌ها',
							children: <WellNotesMobile wellId={irrigatorWells?._id || wellIdFromParams} />,
						},
					]}
				/>
			)}
		</>
	)
}

export default WellMobileView
