import { Button, Drawer, Flex, Form, Typography } from 'antd'
import { useCallback, useMemo, useRef } from 'react'

import styles from './BottomSheetModal.module.css'

const { Title } = Typography

const BottomSheetModal = ({
	open,
	height = null,
	title = '',
	okText = 'ثبت',
	closeText = 'بازگشت',
	onClose,
	hideFooter = false,
	children,
	onSubmit,
	handleSubmit,
	loading,
	errorText,
	form,
}) => {
	const startY = useRef(0)

	const handleClose = useCallback(() => {
		onClose?.()
	}, [onClose])

	const handleTouchStart = useCallback(event => {
		startY.current = event.touches[0]?.clientY ?? 0
	}, [])

	const handleTouchMove = useCallback(
		event => {
			const deltaY = (event.touches[0]?.clientY ?? 0) - startY.current
			if (deltaY > 100) {
				handleClose()
			}
		},
		[handleClose]
	)

	const displayedTitle = useMemo(() => errorText ?? title, [errorText, title])
	const titleColor = errorText ? 'red' : undefined
	const shouldRenderFooter = !hideFooter
	const submitHandler = onSubmit ?? handleSubmit

	return (
		<Drawer
			height={height}
			rootClassName={styles.bottomSheetRoot}
			className={styles.drawer}
			placement='bottom'
			closable={false}
			onClose={handleClose}
			open={open}
		>
			<div className={styles.touchSurface} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
				<Form className={styles.form} form={form} onFinish={submitHandler}>
					<Flex className={styles.content} vertical gap={24}>
						<Flex gap={24} flex={1} vertical>
							<Flex vertical gap={10}>
								<div className={styles.header}>
									<button type='button' onClick={handleClose} className={styles.dragHandle} aria-label='بستن'>
										<span className={styles.dragHandleBar} />
									</button>
								</div>
								<Title className={styles.title} style={{ color: titleColor }} level={3}>
									{displayedTitle}
								</Title>
							</Flex>
							<div className={styles.body}>{children}</div>
						</Flex>
						{shouldRenderFooter && (
							<Flex gap={16} justify='center' className={styles.footer}>
								<Button onClick={handleClose} className={styles.cancelButton}>
									{closeText}
								</Button>
								<Button
									className={styles.confirmButton}
									style={{ backgroundColor: okText === 'پایان آبیاری' ? 'red' : undefined }}
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

export default BottomSheetModal
