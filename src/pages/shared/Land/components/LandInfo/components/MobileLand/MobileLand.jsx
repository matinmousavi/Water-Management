import { Flex, Tabs, Typography } from 'antd'
import tree from '../../../../../../../assets/icons/tree_bold.svg'
import MobileLandInfo from './components/MobileLandInfo/MobileLandInfo'
import MobileLandNotes from './components/MobileLandNotes/MobileLandNotes'
import styles from './MobileLand.module.css'

const MobileLand = ({ landData }) => {
	console.log(landData)

	const items = [
		{
			key: 'specifications',
			label: 'مشخصات',
			children: <MobileLandInfo data={landData} />,
		},
		{
			key: 'notes',
			label: 'یادداشت ها',
			children: <MobileLandNotes notesData={landData?.notes} />,
		},
	]
	return (
		<Flex className={styles.MobileLandConatiner} vertical justify='center' gap={20}>
			<Flex gap={8} align='center' justify='center'>
				<img src={tree} alt='tree icon' />
				<Typography.Title className='title-h1'>{landData?.name}</Typography.Title>
			</Flex>
			<Tabs defaultActiveKey='specifications' items={items} />
		</Flex>
	)
}
export default MobileLand
