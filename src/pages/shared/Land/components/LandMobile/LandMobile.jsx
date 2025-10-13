import { Flex, Tabs } from 'antd'
import tree from '../../../../../assets/icons/tree_bold.svg'
import styles from './LandMobile.module.css'
import LandInfoMobile from './components/LandInfoMobile/LandInfoMobile'
import LandNotesMobile from './components/LandNotesMobile/LandNotesMobile'
import IrrigationLogsMobile from '../../../../../components/responsive/mobile/IrrigationLogsMobile/IrrigationLogsMobile'
import HeaderIrrigation from '../../../../../components/irrigation/HeaderIrrigation/HeaderIrrigation'

const LandMobile = ({ landData, landId }) => {
	const currentIrrigation = landData?.wells?.[0]?.irrigationTarget || null
	const items = [
		{
			key: 'logs',
			label: 'لاگ توزیع',
			children: (
				<IrrigationLogsMobile
					entityType='land'
					entityId={landId}
					wellId={landData.wells?.[0]?._id}
					initialLogs={landData.logs}
					receivedWater={landData.receivedWater}
					requiredWater={landData.requiredWater}
					remainingWater={landData.remainingWater}
					currentIrrigation={currentIrrigation}
				/>
			),
		},
		{
			key: 'specifications',
			label: 'مشخصات',
			children: <LandInfoMobile data={landData} />,
		},
		{
			key: 'notes',
			label: 'یادداشت ها',
			children: <LandNotesMobile notesData={landData?.notes} />,
		},
	]

	return (
		<Flex className={styles.MobileLandContainer} vertical justify='center' gap={20}>
			<HeaderIrrigation icon={tree} link='/' title={`زمین ${landData?.title}`} />
			<Tabs defaultActiveKey='logs' items={items} />
		</Flex>
	)
}
export default LandMobile
