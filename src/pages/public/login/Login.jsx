import { useState } from 'react'
import EnterMobileStep from './components/EnterMobileStep/EnterMobileStep'
import VerifyOtpStep from './components/VerifyOtpStep/VerifyOtpStep'
import { Flex, Card, Typography, Space, Button } from 'antd'
import styles from './Login.module.css'
import img from '../../../assets/images/default-logo.png'

const Login = () => {
	const [step, setStep] = useState(1)
	const [mobile, setMobile] = useState('')
	const [expireDate, setExpireDate] = useState()

	return (
		<Flex className={styles.container} vertical align='center' justify='space-between'>
			<Flex className={styles.card}>
				<Flex vertical className={styles.header} justify='center' align='center' gap={9}>
					<img src={img} alt='Water Logo' width={30} className={styles.logo} />
					<Typography.Title className={styles.title} level={2}>
						مدیریت آب
					</Typography.Title>
				</Flex>
				{step === 1 ? (
					<EnterMobileStep setStep={setStep} setMobile={setMobile} setExpireDate={setExpireDate} />
				) : (
					<VerifyOtpStep mobile={mobile} expireDate={expireDate} onBack={() => setStep(1)} />
				)}
			</Flex>
		</Flex>
	)
}

export default Login
