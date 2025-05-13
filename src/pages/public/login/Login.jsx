import { useState } from 'react'
import MobileNumberForm from './components/MobileNumberForm'
const Login = () => {
	const [step, setStep] = useState(1);
	const [mobile, setMobile] = useState('');
	const [expireDate, setExpireDate] = useState();
	return (
		<MobileNumberForm setStep={setStep} setMobile={setMobile} setExpireDate={setExpireDate} />
	)
}

export default Login