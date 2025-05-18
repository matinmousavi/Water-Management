import { useState, useEffect } from 'react'
import { Form, Input, Button, Flex, Typography } from 'antd'
import img from '../../../../assets/images/water.png'
import useAPI from '../../../../hooks/useAPI'
import useNotification from '../../../../hooks/useNotification'
import english2persian from '../../../../utils/english2persian'
import { useNavigate } from 'react-router'
import { useUser } from '../../../../contexts/UserContext'
import { EditOutlined } from '@ant-design/icons'
import styles from './VerifyOtp.module.css'

const VerifyOtp = ({ mobile, expireDate: initExpireDate, onBack }) => {
	const [form] = Form.useForm()
	const otpValue = Form.useWatch('otp', form)

	const optApi = useAPI()

	const { openNotification } = useNotification()

	const navigate = useNavigate()
	const { getMe } = useUser()

	const [timeLeft, setTimeLeft] = useState(0)
	const [expireDate, setExpireDate] = useState(initExpireDate)
	const [otp] = useState('')

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
		console.log('OTP submitted:', values.otp)
		try {
			const response = await optApi.post('otp/verify', { mobile, otp })
			if (response.success) {
				await getMe()
				openNotification('success', 'ورود با موفقیت انجام شد.!')
				navigate('/')
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
				<p className={styles.text}>کد ۶ رقمی به شماره {english2persian(mobile)} ارسال شد.</p>
				<Flex align='center'>
					<Button type='link' onClick={onBack}>
						<EditOutlined />
						ویرایش شماره موبایل
					</Button>
				</Flex>
				<Form.Item className={styles.input} label='کد تایید ۶ رقمی ' name='otp' rules={[{ required: true, message: 'کد تأیید را وارد کنید!' }]}>
					<Input.OTP autoFocus dir='rtl' value={otp} onChange={val => form.setFieldValue('otp', val)} />
				</Form.Item>

				<div className={styles.timer}>
					{timeLeft > 0 ? (
						`${formatTime(timeLeft)} تا ارسال مجدد کد`
					) : (
						<Flex align='center'>
							<p>کد را دیافت نکرده اید؟</p>
							<Button type='link' onClick={resendOtp}>
								ارسال مجدد کد
							</Button>
						</Flex>
					)}
				</div>

				<Form.Item className={styles.input}>
					<Button htmlType='submit' size='large' block type='primary' disabled={(otpValue || '').length !== 6}>
						ورود
					</Button>
				</Form.Item>
			</Form>
		</div>
	)
}

export default VerifyOtp
