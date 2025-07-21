import { Button, Drawer, Flex, List, Typography } from 'antd'
import styles from './WellsList.module.css'

const WellsList = ({ open, onClose, data, setData }) => {
	const { Title } = Typography

	return (
		<Drawer
			rootClassName={styles.customDrawerRoot}
			className={styles.containerDrawer}
			placement='bottom'
			closable={false}
			height={322}
			onClose={onClose}
			open={open}
		>
			<div className={styles.drawerHeader}>
				<div onClick={onClose} className={styles.lineDrawer}></div>
			</div>
			<Flex gap={8} vertical>
				<Title className={styles.title} level={4}>
					انتخاب چاه
				</Title>
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
		</Drawer>
	)
}

export default WellsList
