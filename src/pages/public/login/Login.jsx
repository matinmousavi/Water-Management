import { useState } from 'react'
import EnterMobileStep from './components/EnterMobileStep/EnterMobileStep'
import VerifyOtpStep from './components/VerifyOtpStep/VerifyOtpStep'
import { Flex, Card, Typography } from 'antd'
import styles from './Login.module.css'
import img from '../../../assets/images/water.png'

const Login = () => {
	const [step, setStep] = useState(1)
	const [mobile, setMobile] = useState('')
	const [expireDate, setExpireDate] = useState()

	return (
		<Flex className={styles.container} justify='center' align='center'>
			<Card className={styles.card}>
				<Flex vertical gap={16}>
					<Flex justify='center' align='center' gap={10}>
						<img src={img} alt='Water Logo' width={55} />
						<Typography.Title level={2}>مدیریت آب</Typography.Title>
					</Flex>

					{step === 1 ? (
						<EnterMobileStep setStep={setStep} setMobile={setMobile} setExpireDate={setExpireDate} />
					) : (
						<VerifyOtpStep mobile={mobile} expireDate={expireDate} onBack={() => setStep(1)} />
					)}
				</Flex>
			</Card>
		</Flex>
	)
}

export default Login
