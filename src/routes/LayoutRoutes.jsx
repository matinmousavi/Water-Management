import { Routes, Route } from 'react-router-dom'
import Layouts from '../layouts/Layouts'
import Dashboard from '../pages/shared/Dashboard/Dashboard'
import Login from '../pages/public/login/Login'
import { useUser } from '../contexts/UserContext'
import Users from '../pages/admin/Users/Users'
import Profile from '../pages/shared/Profile/Profile'
import Land from '../pages/shared/Land/Land'
import Lands from '../pages/shared/Lands/Lands'
import Wells from '../pages/admin/Wells/Wells'
import Well from '../pages/shared/Well/Well'

const LayoutRoutes = () => {
	const { isLogin, isAdmin, isIrrigator } = useUser()
	console.log(isIrrigator || isAdmin)

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
							<Route path='/users' element={<Users />} />
							<Route path='/users/:userId' element={<Profile />} />
							<Route path='/wells/:wellId' element={<Well />} />
							<Route path='/lands' element={<Lands />} />
							<Route path='/lands/:landId' element={<Land />} />
						</>
					)}

					{(isIrrigator || isAdmin) && (
						<>
							<Route path='/wells' element={<Wells />} />
						</>
					)}
				</Route>
			)}
		</Routes>
	)
}

export default LayoutRoutes
