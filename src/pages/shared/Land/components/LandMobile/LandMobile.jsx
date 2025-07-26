import { Flex, Tabs, Typography } from 'antd'
import tree from '../../../../../assets/icons/tree_bold.svg'
import styles from './LandMobile.module.css'
import LandInfoMobile from './components/LandInfoMobile/LandInfoMobile'
import LandNotesMobile from './components/LandMobileNotes/LandNotesMobile'

const LandMobile = ({ landData }) => {
	const items = [
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
			<Flex gap={8} align='center' justify='center'>
				<img src={tree} alt='tree icon' />
				<Typography.Title className='title-h1'>زمین {landData?.title}</Typography.Title>
			</Flex>
			<Tabs defaultActiveKey='specifications' items={items} />
		</Flex>
	)
}
export default LandMobile
