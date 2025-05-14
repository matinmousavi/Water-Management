import { Routes, Route } from 'react-router-dom'
import Layouts from '../layout/Layouts'
import Dashboard from '../pages/admin/Dashboard/Dashboard'
import Login from '../pages/public/login/Login'
import { useUser } from '../contexts/UserContext'
import UsersList from '../pages/admin/UsersList/UsersList'
const LayoutRoutes = () => {
	const { isLogin } = useUser()
	return (
		<Routes>
			{/* {isLogin ? (
				<Route path='/' element={<Login />} />
			) : (
			)} */}
			<Route element={<Layouts />}>
				<Route path='/' element={<Dashboard />} />
				<Route path='/users' element={<UsersList />} />
			</Route>
		</Routes>
	)
}

export default LayoutRoutes
