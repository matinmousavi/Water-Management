import { Form, Input, Button, Typography, Flex } from 'antd'
import useAPI from '../../../../../hooks/useAPI'
import useNotification from '../../../../../hooks/useNotification'
import styles from './EnterMobileStep.module.css'

const EnterMobileStep = ({ setStep, setMobile, setExpireDate }) => {
	const [form] = Form.useForm()
	const api = useAPI()
	const { openNotification } = useNotification()

	const handleSubmit = async ({ mobile }) => {
		try {
			const response = await api.post('otp/send', { mobile })
			if (response.success) {
				setMobile(mobile)
				setExpireDate(response.cooldownUntil)
				setStep(2)
				openNotification('success', 'کد تأیید ارسال شد!')
			}
		} catch (error) {
			openNotification('error', error)
		}
	}

	return (
		<>
			<div className={styles['text-center']}>
				<Typography.Text>برای ورود، شماره موبایل خود را وارد کنید.</Typography.Text>
			</div>

			<Form form={form} layout='vertical' onFinish={handleSubmit}>
				<Flex vertical gap={20}>
					<Form.Item
						className={styles['no-star']}
						label='شماره موبایل'
						name='mobile'
						rules={[
							{ required: true, message: 'شماره موبایل را وارد کنید' },
							{ pattern: /^(۰|0)(۹|9)[0-9۰-۹]{9}$/, message: 'شماره موبایل معتبر نیست' },
						]}
					>
						<Input autoFocus size='large' maxLength={11} inputMode='numeric' />
					</Form.Item>

					<Button type='primary' htmlType='submit' block size='large'>
						ورود
					</Button>
				</Flex>
			</Form>
		</>
	)
}

export default EnterMobileStep
