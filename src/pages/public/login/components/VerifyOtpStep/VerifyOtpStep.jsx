import { useState, useEffect } from 'react'
import { Form, Input, Button, Typography, Flex } from 'antd'
import { EditOutlined } from '@ant-design/icons'
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
		<>
			<Typography.Paragraph className={styles['text-center']}>کد ۶ رقمی به شماره {mobile} ارسال شد.</Typography.Paragraph>

			<Button type='link' icon={<EditOutlined />} onClick={onBack}>
				ویرایش شماره
			</Button>

			<Form form={form} layout='vertical' onFinish={handleVerify} initialValues={{ otp: '' }}>
				<Flex vertical justify='center' gap={20}>
					<Form.Item
						name='otp'
						rules={[
							{ required: true, message: 'کد را وارد کنید!' },
							{ pattern: /^\d{4}$/, message: 'کد باید 4 رقم باشد.' },
						]}
						className={styles.otp}
					>
						<Input.OTP length={4} autoFocus inputMode='numeric' style={{ direction: 'ltr' }} onChange={onOtpChange} />
					</Form.Item>

					{timeLeft > 0 ? (
						<div className={styles['text-center']}>
							<Typography.Text type='secondary'>{formatTime(timeLeft)} تا ارسال مجدد کد</Typography.Text>
						</div>
					) : (
						<div>
							<Typography.Text>کد دریافت نکردید؟</Typography.Text>
							<Button type='link' onClick={resendOtp}>
								ارسال مجدد
							</Button>
						</div>
					)}

					<Button type='primary' htmlType='submit' block size='large' loading={loading}>
						ورود
					</Button>
				</Flex>
			</Form>
		</>
	)
}

export default VerifyOtpStep
