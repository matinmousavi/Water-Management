import { Routes, Route } from 'react-router-dom'
import Layouts from '../layout/Layouts'
import Dashboard from '../pages/admin/Dashboard/Dashboard'
import Login from '../pages/public/login/Login'
import { useUser } from '../contexts/UserContext'
import UsersList from '../pages/admin/UsersList/UsersList'
import Profile from '../pages/shared/Profile/Profile'
const LayoutRoutes = () => {
	const { isLogin, isAdmin } = useUser()
	console.log('login status:', isLogin)

	return (
		<Routes>
			{!isLogin ? (
				<Route path='/' element={<Login />} />
			) : (
				<Route element={<Layouts />}>
					<Route path='/' element={<Dashboard />} />
					<Route path='/profile' element={<Profile />} />
					{!isAdmin && <Route path='/users' element={<UsersList />} />}
				</Route>
			)}
		</Routes>
	)
}

export default LayoutRoutes
