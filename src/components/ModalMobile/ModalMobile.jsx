import { Button, Drawer, Flex, Form, Typography } from 'antd'
import styles from './ModalMobile.module.css'
import { useRef } from 'react'

const ModalMobile = ({
	open,
	height = null,
	title = '',
	okText = 'ثبت',
	closeText = 'بازگشت',
	onClose,
	isButtons = false,
	children,
	handleSubmit,
	loading,
	errorText,
}) => {
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
			height={height}
			rootClassName={styles.ModalMobileRoot}
			className={styles.containerDrawer}
			placement='bottom'
			closable={false}
			onClose={onClose}
			open={open}
		>
			<div className={styles.touchesBox} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
				<Form className={styles.form} onFinish={handleSubmit}>
					<Flex className={styles.contentDrawer} vertical gap={24}>
						<Flex gap={24} flex={1} vertical>
							<Flex vertical gap={10}>
								<div className={styles.drawerHeader}>
									<div onClick={onClose} className={styles.lineDrawer}></div>
								</div>
								<Title className={styles.title} style={{ color: errorText && 'red' }} level={3}>
									{errorText ? errorText : title}
								</Title>
							</Flex>
							<div className={styles.mainContent}>{children}</div>
						</Flex>
						{isButtons ? null : (
							<Flex gap={16} justify='center'>
								<Button onClick={onClose} className={styles.returnButton}>
									{closeText}
								</Button>
								<Button
									className={styles.okButton}
									style={{ backgroundColor: okText == 'پایان آبیاری' ? 'red' : null }}
									type='primary'
									htmlType='submit'
									loading={loading}
								>
									{okText}
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
