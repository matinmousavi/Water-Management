import { useState, useEffect } from 'react'
import { Form, Input, Button } from 'antd'
import img from '../../../../assets/images/water.png'
import useAPI from '../../../../hooks/useAPI'
import useNotification from '../../../../hooks/useNotification'
import english2persian from '../../../../utils/english2persian'
import styles from '../Login.module.css'

const VerifyOtp = ({ mobile, expireDate: initExpireDate }) => {
	const [form] = Form.useForm()

	const optApi = useAPI()

	const { openNotification } = useNotification()

	const [timeLeft, setTimeLeft] = useState(0)
	const [expireDate, setExpireDate] = useState(initExpireDate)
	const [otp, setOtp] = useState('')

	useEffect(() => {
		if (!expireDate) return

		const expire = new Date(expireDate)
		const updateTimeLeft = () => {
			const now = new Date()
			const secondsLeft = Math.floor((expire - now) / 1000)
			setTimeLeft(Math.max(secondsLeft, 0))
		}

		updateTimeLeft()

		const interval = setInterval(updateTimeLeft, 1000)

		return () => clearInterval(interval)
	}, [expireDate])

	const formatTime = seconds => {
		const min = String(Math.floor(seconds / 60)).padStart(2, '0')
		const sec = String(seconds % 60).padStart(2, '0')
		return english2persian(`${min}:${sec}`)
	}

	const isOtpValid = otp.length === 4 && /^\d{4}$/.test(otp)

	const resendOtp = async () => {
		try {
			const response = await optApi.post('otp/send', { mobile })

			if (response.success) {
				openNotification('success', 'کد جدید ارسال شد.')
				setExpireDate(response.cooldownUntil)
			}
		} catch (error) {
			console.error(error)
			openNotification('error', 'ارسال مجدد کد با مشکل مواجه شد.')
		}
	}

	const handleOtpSubmit = async values => {
		const { otp } = values
		try {
			const response = await optApi.post('otp/verify', { mobile, otp })
			if (response.success) {
				openNotification('success', 'ورود با موفقیت انجام شد.!')
			}
		} catch (error) {
			openNotification('error', '  کد اشتباه یا منقضی شده است.    ')
			console.log(error)
		}
	}

	return (
		<div className={styles.formWrapper}>
			<Form form={form} onFinish={handleOtpSubmit} layout='vertical' className={styles.form}>
				<div className={styles.header}>
					<div className={styles.logo}>
						<img src={img} alt='water logo' />
					</div>
					<h2 className={styles.title}>مدیریت آب</h2>
				</div>
				<p className={styles.text}>کد ۴ رقمی به شماره {english2persian(mobile)} ارسال شد.</p>

				<Form.Item
					className={styles.input}
					label='کد تایید ۴ رقمی '
					name='otp'
					rules={[
						{ required: true, message: 'کد تأیید را وارد کنید!' },
						{
							pattern: /^\d{4}$/,
							message: 'کد تأیید باید شامل ۴ رقم باشد!',
						},
					]}
				>
					<Input
						autoFocus
						size='large'
						type='tel'
						inputMode='numeric'
						maxLength={4}
						value={otp}
						onChange={e => {
							setOtp(e.target.value)
						}}
					/>
				</Form.Item>

				<div className={styles.timer}>
					{timeLeft > 0 ? (
						`${formatTime(timeLeft)} تا ارسال مجدد کد`
					) : (
						<Button type='link' onClick={resendOtp}>
							ارسال مجدد کد
						</Button>
					)}
				</div>

				<Form.Item className={styles.input}>
					<Button htmlType='submit' size='large' block type='primary' disabled={!isOtpValid} className={!isOtpValid ? styles.disabledButton : ''}>
						ورود
					</Button>
				</Form.Item>
			</Form>
		</div>
	)
}

export default VerifyOtp
