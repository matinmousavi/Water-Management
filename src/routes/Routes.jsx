import { Routes, Route } from 'react-router-dom'
import App from '../App'
import Login from '../pages/public/login/Login'

const Routes = () => {
	return (
		<Routes>
			<Route path='/login' element={<Login />} />

			{/* <Route path='/' element={<App />} /> */}

			<Route path='*' element={<Errors status='404' />} />
		</Routes>
	)
}

export default Routes
