import { useState, useEffect, useCallback } from 'react'

import { Form, Input, Button, Typography, Flex, Grid } from 'antd'

import { EditOutlined } from '@ant-design/icons'

import useAPI from '../../../hooks/useAPI'

import useNotification from '../../../hooks/useNotification'

import { useUser } from '../../../contexts/UserContext'

import styles from './Login.module.css'

import logoImg from '../../../assets/images/default-logo.png'

const Login = () => {
	const [loginStep, setLoginStep] = useState(1)

	const [otpFormState, setOtpFormState] = useState({
		mobile: '',
		otp: '',
		demoOtp: '',
		otpExpireDate: null,
		otpTimeLeft: 0,
	})

	const [form] = Form.useForm()

	const screens = Grid.useBreakpoint()

	const isMobileView = screens.xs

	const api = useAPI()

	const { openNotification } = useNotification()

	const { getMe } = useUser()

	useEffect(() => {
		if (!otpFormState.otpExpireDate) return

		const updateOtpTimer = () => {
			const now = new Date()
			const end = new Date(otpFormState.otpExpireDate)

			setOtpFormState(prev => ({
				...prev,
				otpTimeLeft: Math.max(Math.floor((end - now) / 1000), 0),
			}))
		}

		updateOtpTimer()

		const interval = setInterval(updateOtpTimer, 1000)

		return () => clearInterval(interval)
	}, [otpFormState.otpExpireDate])

	const formatTime = useCallback(seconds => {
		const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
		const secondsRemaining = String(seconds % 60).padStart(2, '0')

		return `${minutes}:${secondsRemaining}`
	}, [])

	const handleResendOtp = useCallback(async () => {
		try {
			const response = await api.post('otp/send', {
				mobile: otpFormState.mobile,
			})

			if (response.success) {
				setOtpFormState(prev => ({
					...prev,
					demoOtp: response.demoOtp,
					otpExpireDate: response.cooldownUntil,
				}))

				openNotification('success', 'کد جدید ارسال شد.')
			}
		} catch (err) {
			openNotification('error', err?.error.message || 'ارسال مجدد کد با مشکل مواجه شد.')
		}
	}, [api, otpFormState.mobile, openNotification])

	const handleEditMobile = () => {
		setLoginStep(1)

		form.setFieldsValue({
			mobile: otpFormState.mobile,
			otp: '',
		})

		setOtpFormState(prev => ({
			...prev,
			otp: '',
			demoOtp: '',
			otpTimeLeft: 0,
			otpExpireDate: null,
		}))
	}

	const handleFormSubmit = async values => {
		if (loginStep === 1) {
			try {
				const response = await api.post('otp/send', {
					mobile: values.mobile,
				})

				if (response.success) {
					setOtpFormState(prev => ({
						...prev,
						mobile: values.mobile,
						demoOtp: response.demoOtp,
						otpExpireDate: response.cooldownUntil,
					}))

					setLoginStep(2)

					openNotification('success', 'کد تأیید ارسال شد!')
				}
			} catch (err) {
				openNotification('error', err?.error.message || 'خطا در ارسال کد OTP.')
			}
		} else {
			try {
				const response = await api.post('otp/verify', {
					mobile: otpFormState.mobile,
					otp: values.otp,
				})

				if (response.success) {
					openNotification('success', 'ورود با موفقیت انجام شد!')

					await getMe()
				} else {
					openNotification('error', 'کد نادرست یا منقضی شده است.')
				}
			} catch (err) {
				openNotification('error', err?.error.message || 'کد نادرست یا منقضی شده است.')
			}
		}
	}

	return (
		<Flex className={styles.loginContainer} vertical align='center' justify={isMobileView ? 'flex-end' : 'center'}>
			<Flex className={styles.loginWrapper} vertical align='center'>
				<Flex vertical justify='space-between' align='center' gap={1} className={styles.loginBrand}>
					<img src={logoImg} alt='Water Logo' width={24} />

					<Typography.Title className={styles.loginTitle} level={2}>
						مدیریت آب
					</Typography.Title>
				</Flex>

				<Form
					form={form}
					layout='vertical'
					className={styles.loginForm}
					onFinish={handleFormSubmit}
					initialValues={{
						mobile: '',
						otp: '',
					}}
				>
					<Flex className={styles.loginFormWrapper} vertical>
						{loginStep === 1 ? (
							<Flex vertical gap={isMobileView ? 20 : 8}>
								<Typography.Text className={`${styles.loginInfo} ${styles.loginInfoRight}`}>شماره موبایل خود را وارد کنید.</Typography.Text>

								<Form.Item
									name='mobile'
									rules={[
										{
											required: true,
											message: 'شماره موبایل را وارد کنید',
										},
										{
											pattern: /^(۰|0)(۹|9)[0-9۰-۹]{9}$/,
											message: 'شماره موبایل معتبر نیست',
										},
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
										onPressEnter={() => form.submit()}
										className={styles.loginInput}
									/>
								</Form.Item>
							</Flex>
						) : (
							<Flex vertical gap={32}>
								<Flex vertical gap={16}>
									<Typography.Text className={`${styles.loginInfo} ${styles.loginInfoCenter}`}>
										کد تأیید ۴ رقمی به شماره <span className={styles.loginMobile}>{otpFormState.mobile}</span> ارسال شد.
									</Typography.Text>

									<Flex
										vertical
										align='center'
										justify='center'
										gap={4}
										style={{
											background: '#f5f9ff',
											border: '1px solid #d6e4ff',
											borderRadius: 10,
											padding: '10px 16px',
										}}
									>
										<Typography.Text type='secondary' style={{ fontSize: 12 }}>
											کد ورود آزمایشی
										</Typography.Text>

										<Typography.Text
											strong
											style={{
												fontSize: 22,
												letterSpacing: 4,
												direction: 'ltr',
											}}
										>
											{otpFormState.demoOtp}
										</Typography.Text>
									</Flex>

									<Button className={styles.linkBtn} type='link' onClick={handleEditMobile}>
										<EditOutlined />
										ویرایش شماره
									</Button>

									<Form.Item
										name='otp'
										className={styles.loginOtpItem}
										rules={[
											{
												required: true,
												message: 'کد را وارد کنید!',
											},
											{
												pattern: /^\d{4}$/,
												message: 'کد باید 4 رقم باشد.',
											},
										]}
									>
										<Input.OTP
											size='large'
											length={4}
											autoFocus
											inputMode='numeric'
											style={{
												direction: 'ltr',
											}}
											onPressEnter={() => form.submit()}
										/>
									</Form.Item>
								</Flex>

								<div className={styles.resendWrapper}>
									{otpFormState.otpTimeLeft > 0 ? (
										<Flex gap={5} justify='center' align='center'>
											<Typography.Text type='secondary' className='text-center'>
												{formatTime(otpFormState.otpTimeLeft)} تا ارسال مجدد کد
											</Typography.Text>
										</Flex>
									) : (
										<Flex gap={5} justify='center' align='center'>
											<Typography.Text className={styles.loginResendText}>کد را دریافت نکرداید؟</Typography.Text>

											<Button className={styles.linkBtn} type='link' onClick={handleResendOtp}>
												ارسال مجدد کد
											</Button>
										</Flex>
									)}
								</div>
							</Flex>
						)}

						<Button type='primary' htmlType='submit' block size='large' loading={api.isLoading}>
							{loginStep === 1 ? 'ارسال کد تأیید' : 'ورود'}
						</Button>
					</Flex>
				</Form>
			</Flex>
		</Flex>
	)
}

export default Login
