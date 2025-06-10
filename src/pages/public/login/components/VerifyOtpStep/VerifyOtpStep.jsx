import { useState, useEffect } from 'react'
import { Form, Input, Button, Typography, Flex } from 'antd'
import useAPI from '../../../../../hooks/useAPI'
import useNotification from '../../../../../hooks/useNotification'
import { useUser } from '../../../../../contexts/UserContext'
import styles from './VerifyOtpStep.module.css'

const VerifyOtpStep = ({ mobile, expireDate: initialExpireDate, onBack }) => {
	const [form] = Form.useForm()
	const [timeLeft, setTimeLeft] = useState(0)
	const [expireDate, setExpireDate] = useState(initialExpireDate)
	const [loading, setLoading] = useState(false)

	const { openNotification } = useNotification()
	const api = useAPI()
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

	const handleVerify = async ({ otp }) => {
		setLoading(true)
		try {
			const response = await api.post('otp/verify', { mobile, otp })
			if (response.success) {
				openNotification('success', 'ورود با موفقیت انجام شد!')
				await getMe()
			} else {
				openNotification('error', 'کد نادرست یا منقضی شده است.')
			}
		} catch {
			openNotification('error', 'کد نادرست یا منقضی شده است.')
		} finally {
			setLoading(false)
		}
	}

	const formatTime = seconds => {
		const min = String(Math.floor(seconds / 60)).padStart(2, '0')
		const sec = String(seconds % 60).padStart(2, '0')
		return `${min}:${sec}`
	}

	const onOtpChange = value => {
		form.setFieldsValue({ otp: value })
		if (value.length === 4) {
			form.submit()
		}
	}

	return (
		<Flex className={styles.otpContainer} vertical gap={20}>
			<Typography.Text className='title-login'>کد تایید 4 رقمی به شماره {mobile} ارسال شد.</Typography.Text>
			<Button type='link' onClick={onBack}>
				ویرایش شماره تماس
			</Button>
			<Form form={form} className={styles.formOtp} layout='vertical' onFinish={handleVerify} initialValues={{ otp: '' }}>
				<Flex vertical justify='center' gap={35}>
					<Form.Item
						name='otp'
						rules={[
							{ required: true, message: 'کد را وارد کنید!' },
							{ pattern: /^\d{4}$/, message: 'کد باید 4 رقم باشد.' },
						]}
						className={styles.formItem}
					>
						<Input.OTP length={4} autoFocus inputMode='numeric' style={{ direction: 'ltr' }} onChange={onOtpChange} />
					</Form.Item>

					{timeLeft > 0 ? (
						<div className={styles['text-center']}>
							<Typography.Text className={styles['otp-text']} type='secondary'>
								{formatTime(timeLeft)} تا ارسال مجدد کد
							</Typography.Text>
						</div>
					) : (
						<div className={styles['text-center']}>
							<Typography.Text className={styles['otp-text']}>کد دریافت نکردید؟</Typography.Text>
							<Button size={14} type='link' onClick={resendOtp}>
								ارسال مجدد
							</Button>
						</div>
					)}
				</Flex>
				<Button type='primary' htmlType='submit' block size={16} loading={loading}>
					ورود
				</Button>
			</Form>
		</Flex>
	)
}

export default VerifyOtpStep
