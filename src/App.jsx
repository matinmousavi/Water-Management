import { App as AntApp } from 'antd'
import { useUser } from './contexts/UserContext'
import LayoutRoutes from './routes/LayoutRoutes'
import './App.css'

function App() {
	const { isLogin } = useUser()
	console.log(isLogin)
	return (
		<AntApp>
			<LayoutRoutes isLogin={isLogin} />
		</AntApp>
	)
}

export default App
