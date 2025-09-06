import { Flex, Tabs, Typography } from 'antd'
import tree from '../../../../../assets/icons/tree_bold.svg'
import styles from './LandMobile.module.css'
import LandInfoMobile from './components/LandInfoMobile/LandInfoMobile'
import LandNotesMobile from './components/LandMobileNotes/LandNotesMobile'
import LandLogsMobile from './components/LandLogsMobile/LandLogsMobile'
import HeaderIrrigation from '../../../../../components/HeaderIrrigation/HeaderIrrigation'

const LandMobile = ({ landData }) => {
	const items = [
		{
			key: 'logs',
			label: 'لاگ توزیع',
			children: <LandLogsMobile data={landData} />,
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
