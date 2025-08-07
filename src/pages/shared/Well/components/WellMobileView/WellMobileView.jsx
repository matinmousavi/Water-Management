import { useState } from 'react'
import { Typography, Flex, Tabs, Empty } from 'antd'
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons'
import WellsList from './components/WellsList/WellsList'
import WellLogsMobile from './components/WellLogsMobile/WellLogsMobile'
import WellNotesMobile from './components/WellNotesMobile/WellNotesMobile'

const WellMobileView = ({ irrigatorWells, setIrrigatorWells, filterWells }) => {
	const [openWellList, setOpenWellList] = useState(false)

	const onCloseWellList = () => setOpenWellList(false)

	return (
		<>
			<Flex gap={8} justify='center' align='center'>
				<img src='/assets/icons/Vector.svg' alt='icon' />
				<Typography.Title level={2} className='text-h2'>
					چاه {irrigatorWells?.title}
				</Typography.Title>
				{filterWells?.length <= 1 ? null : openWellList ? (
					<CaretUpOutlined onClick={() => setOpenWellList(false)} style={{ color: '#00000073' }} />
				) : (
					<CaretDownOutlined onClick={() => setOpenWellList(true)} style={{ color: '#00000073' }} />
				)}
				<WellsList setData={setIrrigatorWells} data={filterWells} onClose={onCloseWellList} open={openWellList} />
			</Flex>

			<Tabs
				defaultActiveKey='logs'
				items={[
					{
						key: 'logs',
						label: 'نوبت آبیاری',
						children: (
							<Flex vertical gap={16}>
								{irrigatorWells?.logs?.length == 0 ? <Empty /> : irrigatorWells?.logs?.map(log => <WellLogsMobile key={log?._id} data={log} />)}
							</Flex>
						),
					},
					{
						key: 'notes',
						label: 'یادداشت‌ها',
						children: <WellNotesMobile wellId={irrigatorWells?._id} />,
					},
				]}
			/>
		</>
	)
}

export default WellMobileView
