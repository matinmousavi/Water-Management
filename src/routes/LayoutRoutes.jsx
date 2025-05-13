import { Routes, Route } from 'react-router-dom'
import Layouts from '../layout/Layouts'
import Dashboard from '../pages/admin/Dashboard/Dashboard'

const LayoutRoutes = () => (
	<Routes>
		<Route element={<Layouts />}>
			<Route path='/' element={<Dashboard />} />
		</Route>
	</Routes>
)

export default LayoutRoutes
