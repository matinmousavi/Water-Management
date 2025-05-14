import { Routes, Route } from 'react-router-dom'
import Layouts from '../layout/Layouts'
import Dashboard from '../pages/admin/Dashboard/Dashboard'
import Admin from '../pages/admin/UsersList/UsersList'
import Profile from '../pages/shared/Profile/Profile'

const LayoutRoutes = () => (
	<Routes>
		<Route element={<Layouts />}>
			<Route path='/' element={<Dashboard />} />
			<Route path='/profile' element={<Profile />} />
			<Route path='/admin' element={<Admin />} />
		</Route>
	</Routes>
)

export default LayoutRoutes
