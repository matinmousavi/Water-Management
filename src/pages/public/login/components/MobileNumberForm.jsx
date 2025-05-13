import { Form, Input, Button, notification } from 'antd'
import styles from '../Login.module.css'
import img from '../../../../assets/images/water.png'
import useAPI from '../../../../hooks/useAPI'
import useNotification from '../../../../hooks/useNotification'

const MobileNumberForm = ({ setStep, setMobile, setExpireDate }) => {
	const [form] = Form.useForm()
	const optApi = useAPI()
	const { openNotification } = useNotification()
	const handleMobileSubmit = async values => {
		const { mobile } = values
		try {
			const response = await optApi.post('otp/send', { mobile })
			if (response.success) {
				setStep(2)
				setMobile(mobile)
				setExpireDate(response.cooldownUntil)
				openNotification('success', 'کد تأیید ارسال شد!')
			}
		} catch (error) {
			openNotification('error', 'کاربری با این شماره موبایل یافت نشد')
		}
	}

	return (
		<div className={styles.formWrapper}>
			<Form form={form} onFinish={handleMobileSubmit} layout='vertical' className={styles.form}>
				<div className={styles.header}>
					<div className={styles.logo}>
						<img src={img} alt='water logo' />
					</div>
					<h2 className={styles.title}>مدیریت آب</h2>
				</div>
				<p className={styles.text}>برای ورود به پنل، شماره موبایل خود را وارد کنید.</p>
				<Form.Item
					className={styles.input}
					label='شماره موبایل'
					name='mobile'
					rules={[
						{ message: 'شماره موبایل خود را وارد کنید!' },
						{
							pattern: /^(۰|0)(۹|9)[0-9۰-۹]{9}$/,
							message: 'شماره موبایل معتبر نیست!',
						},
					]}
				>
					<Input autoFocus size='large' type='tel' inputMode='numeric' maxLength={11} />
				</Form.Item>

				<Form.Item className={styles.input}>
					<Button htmlType='submit' size='large' block type='primary'>
						ورود
					</Button>
				</Form.Item>
			</Form>
		</div>
	)
}

export default MobileNumberForm
