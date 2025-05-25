import { Routes, Route } from 'react-router-dom'
import Layouts from '../layout/Layouts'
import Dashboard from '../pages/shared/Dashboard/Dashboard'
import Login from '../pages/public/login/Login'
import { useUser } from '../contexts/UserContext'
import UsersList from '../pages/admin/UsersList/UsersList'
import Profile from '../pages/shared/Profile/Profile'
import Land from '../pages/shared/Land/Land'
import Lands from '../pages/shared/Lands/Lands'
import WellsList from '../pages/admin/WellsList/WellsList'

const LayoutRoutes = () => {
	const { isLogin, isAdmin } = useUser()

	return (
		<Routes>
			{!isLogin ? (
				<Route path='/*' element={<Login />} />
			) : (
				<Route element={<Layouts />}>
					<Route index element={<Dashboard />} />
					<Route path='/profile' element={<Profile />} />
					{isAdmin && (
						<>
							<Route path='/users' element={<UsersList />} />
							<Route path='/users/:userId' element={<Profile />} />

							<Route path='/wells' element={<WellsList />} />
							<Route path='/lands' element={<Lands />} />
							<Route path='/lands/:landId' element={<Land />} />
						</>
					)}
				</Route>
			)}
		</Routes>
	)
}

export default LayoutRoutes
