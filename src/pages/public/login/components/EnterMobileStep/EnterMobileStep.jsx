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
			<Form form={form} layout='vertical' onFinish={handleSubmit}>
				<Flex vertical justify='space-between' className={styles.formContainer} gap={20}>
					<Form.Item
						className={styles.formItem}
						label='شماره موبایل خود را وارد وارد کنید'
						name='mobile'
						rules={[
							{ required: true, message: 'شماره موبایل را وارد کنید' },
							{ pattern: /^(۰|0)(۹|9)[0-9۰-۹]{9}$/, message: 'شماره موبایل معتبر نیست' },
						]}
					>
						<Input autoFocus size='large' maxLength={11} inputMode='numeric' />
					</Form.Item>

					<Button type='primary' htmlType='submit' block size='large'>
						ارسال کد تایید
					</Button>
				</Flex>
			</Form>
		</>
	)
}

export default EnterMobileStep
