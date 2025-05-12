import { Routes, Route } from 'react-router-dom'
import Login from '../pages/public/login/Login'

const AuthRoutes = () => (
	<Routes>
		<Route path='/' element={<Login />} />
	</Routes>
)

export default AuthRoutes
