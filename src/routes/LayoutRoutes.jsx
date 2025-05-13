import { Routes, Route } from 'react-router-dom'
import Layouts from '../layout/Layouts'
import Login from '../pages/public/login/Login'
import Profile from '../pages/landOwner/profile/Profile'

const LayoutRoutes = ({ isLogin }) => (
	<Routes>
		<Route path='/' element={<Login />} />
		{/* {isLogin && ( */}
		<Route element={<Layouts />}>
			<Route path='/profile' element={<Profile />} />
		</Route>
		{/* )} */}
	</Routes>
)

export default LayoutRoutes
