import { useState } from 'react'
import MobileNumberForm from './components/MobileNumberForm'
const Login = () => {
	const [step, setStep] = useState(1);
	const [mobile, setMobile] = useState('');
	const changeStep = stepParam => {
		setStep(stepParam)
	}
	const getMobile = mobileParam => {
		setMobile(mobileParam)
	}
	return (
		<MobileNumberForm setStep={changeStep} setMobile={getMobile} />
	)
}

export default Login