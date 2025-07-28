import { useState, useEffect } from 'react'
import { Form, Input, Button, Typography, Flex, Grid } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'
import { useUser } from '../../../contexts/UserContext'
import styles from './Login.module.css'
import img from '../../../assets/images/default-logo.png'

const Login = () => {
	const [step, setStep] = useState(1)
	const [mobile, setMobile] = useState('')
	const [expireDate, setExpireDate] = useState()
	const [timeLeft, setTimeLeft] = useState(0)
	const [form] = Form.useForm()
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs
	const api = useAPI()
	const { openNotification } = useNotification()
	const { getMe } = useUser()

	useEffect(() => {
		if (!expireDate) return
		const updateTimer = () => {
			const now = new Date()
			const end = new Date(expireDate)
			setTimeLeft(Math.max(Math.floor((end - now) / 1000), 0))
		}
		updateTimer()
		const interval = setInterval(updateTimer, 1000)
		return () => clearInterval(interval)
	}, [expireDate])

	const formatTime = seconds => {
		const min = String(Math.floor(seconds / 60)).padStart(2, '0')
		const sec = String(seconds % 60).padStart(2, '0')
		return `${min}:${sec}`
	}

	const resendOtp = async () => {
		try {
			const response = await api.post('otp/send', { mobile })
			if (response.success) {
				openNotification('success', 'کد جدید ارسال شد.')
				setExpireDate(response.cooldownUntil)
			}
		} catch {
			openNotification('error', 'ارسال مجدد کد با مشکل مواجه شد.')
		}
	}

	const handleEditMobileClick = () => {
		setStep(1)
		form.resetFields()
	}

	const handleResendClick = () => {
		resendOtp()
	}

	const handleSubmit = async values => {
		if (step === 1) {
			try {
				const response = await api.post('otp/send', { mobile: values.mobile })
				if (response.success) {
					setMobile(values.mobile)
					setExpireDate(response.cooldownUntil)
					setStep(2)
					openNotification('success', 'کد تأیید ارسال شد!')
				}
			} catch (error) {
				openNotification('error', error)
			}
		} else {
			try {
				const response = await api.post('otp/verify', { mobile, otp: values.otp })
				if (response.success) {
					openNotification('success', 'ورود با موفقیت انجام شد!')
					await getMe()
				} else {
					openNotification('error', 'کد نادرست یا منقضی شده است.')
				}
			} catch {
				openNotification('error', 'کد نادرست یا منقضی شده است.')
			}
		}
	}

	return (
		<Flex className={styles.container} vertical align='center' justify={isMobile ? 'flex-end' : 'center'}>
			<Flex className={styles.wrapper} vertical align='center'>
				<Flex vertical justify='space-between' align='center' className={styles['brand-container']}>
					<img src={img} alt='Water Logo' width={24} />
					<Typography.Title className={styles.title} level={2}>
						مدیریت آب
					</Typography.Title>
				</Flex>

				<Form form={form} layout='vertical' className={styles.form} onFinish={handleSubmit} initialValues={{ mobile: '', otp: '' }}>
					<Flex className={styles['form-wrapper']} vertical>
						{step === 1 ? (
							<Flex vertical gap={8}>
								<Typography.Text className='title-login'>شماره موبایل خود را وارد کنید.</Typography.Text>
								<Form.Item
									name='mobile'
									rules={[
										{ required: true, message: 'شماره موبایل را وارد کنید' },
										{ pattern: /^(۰|0)(۹|9)[0-9۰-۹]{9}$/, message: 'شماره موبایل معتبر نیست' },
									]}
								>
									<Input
										autoFocus
										size='large'
										maxLength={11}
										inputMode='numeric'
										onKeyPress={e => {
											if (!/[0-9]/.test(e.key)) {
												e.preventDefault()
											}
										}}
									/>
								</Form.Item>
							</Flex>
						) : (
							<Flex vertical gap={32}>
								<Flex vertical gap={16}>
									<Typography.Text className={styles.containerMobile}>
										کد تأیید ۴ رقمی به شماره <span className={styles.mobile}>{mobile}</span> ارسال شد.
									</Typography.Text>
									<Button className={styles['link-btn']} type='link' onClick={handleEditMobileClick}>
										<EditOutlined />
										ویرایش شماره
									</Button>
									<Form.Item
										name='otp'
										className={styles['otp-item']}
										rules={[
											{ required: true, message: 'کد را وارد کنید!' },
											{ pattern: /^\d{4}$/, message: 'کد باید 4 رقم باشد.' },
										]}
									>
										<Input.OTP size='large' length={4} autoFocus inputMode='numeric' style={{ direction: 'ltr' }} />
									</Form.Item>
								</Flex>

								<div className={styles['resend-wrapper']}>
									{timeLeft > 0 ? (
										<Flex gap={5} justify='center' align='center'>
											<Typography.Text type='secondary' className='text-center'>
												{formatTime(timeLeft)} تا ارسال مجدد کد
											</Typography.Text>
										</Flex>
									) : (
										<Flex gap={5} justify='center' align='center'>
											<Typography.Text className={styles.resendCode}>کد را دریافت نکرداید؟</Typography.Text>
											<Button className={styles['link-btn']} type='link' onClick={handleResendClick}>
												ارسال مجدد
											</Button>
										</Flex>
									)}
								</div>
							</Flex>
						)}

						<Button type='primary' htmlType='submit' block size='large' loading={api.isLoading}>
							{step === 1 ? 'ارسال کد تأیید' : 'ورود'}
						</Button>
					</Flex>
				</Form>
			</Flex>
		</Flex>
	)
}

export default Login
