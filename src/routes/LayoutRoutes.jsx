import { Routes, Route } from 'react-router-dom'
import Layouts from '../layout/Layouts'
import Login from '../pages/public/login/Login'
import Home from '../pages/public/home/Home'

const LayoutRoutes = ({ isLogin }) => (
	<Routes>
		{isLogin ? (
			<Route element={<Layouts />}>
				<Route path='/home' element={<Home />} />
			</Route>
		) : (
			<Route path='/' element={<Login />} />
		)}
	</Routes>
)

export default LayoutRoutes
