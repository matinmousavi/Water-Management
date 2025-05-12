import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { APIProvider } from './hooks/useAPI.jsx'
import UserProvider from './contexts/UserContext.jsx'
import { ConfigProvider } from 'antd'

import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<ConfigProvider
			theme={{
				token: {
					fontFamily: 'Vazirmatn',
					colorPrimary: '#3372EF',
					borderRadius: 8,
				},
				components: {
					Button: {
						borderRadiusLG: 8,
						contentFontSizeLG: 14,
						primaryShadow: 'none',
						controlHeightLG: 40,
						colorPrimary: '#34B1AA',
						defaultBorderColor: 'rgba(217, 217, 217, 1)',
						colorLink: 'rgba(59, 143, 243, 1)',
						paddingInlineLG: 40,
					},
					Input: {
						borderRadius: 4,
						activeShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
					},
				},
			}}
		>
			<BrowserRouter>
				<UserProvider>
					<App />
				</UserProvider>
			</BrowserRouter>
		</ConfigProvider>
	</StrictMode>
)
