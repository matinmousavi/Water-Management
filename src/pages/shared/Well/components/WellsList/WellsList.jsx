import { Button, Drawer, Flex, List, Typography } from 'antd'
import styles from './WellsList.module.css'
import ModalMobile from '../../../../../components/ModalMobile/ModalMobile'

const WellsList = ({ open, onClose, data, setData }) => {
	const { Title } = Typography

	return (
		<ModalMobile open={open} isList title='انتخاب چاه' onClose={onClose} handleSubmit={setData}>
			<Flex gap={8} vertical>
				<List className={styles.list}>
					{data?.map(well => (
						<List.Item key={well?._id} className={styles.listItem}>
							<Button onClick={() => setData(well)} className={styles.listButton} type='text'>
								{well?.title}
							</Button>
						</List.Item>
					))}
				</List>
			</Flex>
		</ModalMobile>
	)
}

export default WellsList
