import { useState } from 'react'
import MobileNumberForm from './components/MobileNumberForm'
import VerifyOtp from './components/VerifyOtp'

const Login = () => {
	const [step, setStep] = useState(1)
	const [mobile, setMobile] = useState('')
	const [expireDate, setExpireDate] = useState()

	return (
		<>
			{step === 1 && <MobileNumberForm setStep={setStep} setMobile={setMobile} setExpireDate={setExpireDate} />}
			{step === 2 && <VerifyOtp mobile={mobile} expireDate={expireDate} />}
		</>
	)
}

export default Login
