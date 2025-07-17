import { Button, Drawer, Flex, List, Typography } from 'antd'
import { useState } from 'react'
import styles from './WellsList.module.css'

const WellsList = ({ open, onClose }) => {
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
					<List.Item className={styles.listItem}>
						<Button className={styles.listButton} type='text'>
							الف
						</Button>
					</List.Item>
					<List.Item className={styles.listItem}>
						<Button className={styles.listButton} type='text'>
							الف
						</Button>
					</List.Item>
					<List.Item className={styles.listItem}>
						<Button className={styles.listButton} type='text'>
							الف
						</Button>
					</List.Item>
					<List.Item className={styles.listItem}>
						<Button className={styles.listButton} type='text'>
							الف
						</Button>
					</List.Item>
				</List>
			</Flex>
		</Drawer>
	)
}

export default WellsList
