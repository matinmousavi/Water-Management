import { Routes, Route } from 'react-router-dom'
import Layouts from '../layout/Layouts'
import Dashboard from '../pages/admin/Dashboard/Dashboard'
import Admin from '../pages/admin/Admin'

const LayoutRoutes = () => (
	<Routes>
		<Route element={<Layouts />}>
			<Route path='/' element={<Dashboard />} />
			<Route path='/admin' element={<Admin />} />
		</Route>
	</Routes>
)

export default LayoutRoutes
