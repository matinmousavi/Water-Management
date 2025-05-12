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
	console.log(mobile);
	console.log(step);
	
	return (
		<MobileNumberForm setStep={changeStep} setMobile={getMobile}  />
	)
}

export default Login