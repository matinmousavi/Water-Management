import { Flex, Tabs } from 'antd'
import tree from '../../../../../assets/icons/tree_bold.svg'
import styles from './LandMobile.module.css'
import LandInfoMobile from './components/LandInfoMobile/LandInfoMobile'
import LandNotesMobile from './components/LandMobileNotes/LandNotesMobile'
import MobileIrrigationLogs from '../../../../../components/responsive/mobile/MobileIrrigationLogs/MobileIrrigationLogs'
import HeaderIrrigation from '../../../../../components/irrigation/HeaderIrrigation/HeaderIrrigation'

const LandMobile = ({ landData, landId }) => {
	const items = [
		{
			key: 'logs',
			label: 'لاگ توزیع',
			children: (
                                <MobileIrrigationLogs
                                        entityType='land'
                                        entityId={landId}
                                        wellId={landData.wells?.[0]?._id}
                                        initialLogs={landData.logs}
                                        receivedWater={landData.receivedWater}
                                        requiredWater={landData.requiredWater}
                                        remainingWater={landData.remainingWater}
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
