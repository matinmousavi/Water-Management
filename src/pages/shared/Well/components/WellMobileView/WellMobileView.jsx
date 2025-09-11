import { useState, useEffect } from 'react'
import { Typography, Flex, Tabs, Empty } from 'antd'
import { ArrowRightOutlined, CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons'
import { Link, useSearchParams } from 'react-router-dom'

import WellsList from './components/WellsList/WellsList'
import WellLogsMobile from './components/WellLogsMobile/WellLogsMobile'
import WellNotesMobile from './components/WellNotesMobile/WellNotesMobile'
import useAPI from '../../../../../hooks/useAPI'

const WellMobileView = ({ irrigatorWells, setIrrigatorWells, filterWells }) => {
	const [openWellList, setOpenWellList] = useState(false)
	const [searchParams, setSearchParams] = useSearchParams()
	const schedulesApi = useAPI()
	const schedules = schedulesApi?.data?.schedules

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

	return (
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
				<Link
					to='/'
					style={{
						position: 'absolute',
						right: '16px',
						color: '#000000',
					}}
				>
					<ArrowRightOutlined
						style={{
							fontSize: '16px',
							marginTop: '8px',
						}}
					/>
				</Link>
			</Flex>

			<Tabs
				defaultActiveKey='logs'
				items={[
					{
						key: 'logs',
						label: 'نوبت آبیاری',
						children: (
							<Flex vertical gap={16}>
								{schedules?.length > 0 ? (
									schedules.map(log => (
										<WellLogsMobile wellId={irrigatorWells?._id || wellIdFromParams} key={log?._id || log.id} data={log} />
									))
								) : (
									<Empty />
								)}
							</Flex>
						),
					},
					{
						key: 'notes',
						label: 'یادداشت‌ها',
						children: <WellNotesMobile wellId={irrigatorWells?._id || wellIdFromParams} />,
					},
				]}
			/>
		</>
	)
}

export default WellMobileView
