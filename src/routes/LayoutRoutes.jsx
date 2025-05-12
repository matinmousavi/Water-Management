import { Routes, Route } from 'react-router-dom'
import Layouts from '../layout/Layouts'
import Login from '../pages/public/login/Login'
import Home from '../pages/public/home/Home'

const LayoutRoutes = ({ isLogin }) => (
	<Routes>
		<Route path='/' element={<Login />} />
		{isLogin && (
			<Route element={<Layouts />}>
				<Route path='/' element={<Home />} />
			</Route>
		)}
	</Routes>
)

export default LayoutRoutes
