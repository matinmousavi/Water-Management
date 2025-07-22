import { Button, Drawer, Flex, Form, Typography } from 'antd'
import styles from './ModalMobile.module.css'
import { useRef } from 'react'

const ModalMobile = ({ open, title = '', onClose, isList = false, children, handleSubmit, loading, height = 322 }) => {
	const startY = useRef(0)
	const { Title } = Typography
	const handleTouchStart = e => {
		startY.current = e.touches[0].clientY
	}

	const handleTouchMove = e => {
		const deltaY = e.touches[0].clientY - startY.current
		if (deltaY > 100) {
			onClose()
		}
	}

	return (
		<Drawer
			rootClassName={styles.ModalMobileRoot}
			className={styles.containerDrawer}
			placement='bottom'
			closable={false}
			height={height}
			onClose={onClose}
			open={open}
		>
			<div className={styles.touchesBox} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
				<Form className={styles.form} layout='vertical' size='large' onFinish={handleSubmit}>
					<Flex className={styles.contentDrawer} vertical gap={24}>
						<Flex gap={24} flex={1} vertical>
							<Flex vertical gap={10}>
								<div className={styles.drawerHeader}>
									<div onClick={onClose} className={styles.lineDrawer}></div>
								</div>
								<Title className={styles.title} level={3}>
									{title}
								</Title>
							</Flex>
							<div className={styles.mainContent}>{children}</div>
						</Flex>
						{isList ? null : (
							<Flex gap={16} justify='center'>
								<Button onClick={onClose} className={styles.returnButton}>
									بازگشت
								</Button>
								<Button className={styles.okButton} type='primary' htmlType='submit' loading={loading}>
									ثبت
								</Button>
							</Flex>
						)}
					</Flex>
				</Form>
			</div>
		</Drawer>
	)
}

export default ModalMobile
