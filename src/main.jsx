import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import UserProvider from './contexts/UserContext.jsx'
import { ConfigProvider } from 'antd'
import fa_IR from 'antd/locale/fa_IR'

import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<ConfigProvider
			direction='rtl'
			locale={fa_IR}
			theme={{
				token: {
					fontFamily: 'VazirmatnFD',
					colorPrimary: '#3372EF',
					borderRadius: 8,
					fontSize: 16,
				},
				components: {
					Layout: {
						headerPadding: '0 20px',
					},
					Menu: {
						itemMarginInline: 20,
					},
					Button: {
						primaryShadow: 'none',
						colorPrimary: '#0066EE',
						defaultBorderColor: '#0066EE',
						colorLink: 'rgba(59, 143, 243, 1)',
						colorText: '#0066EE',
						controlHeight: 42,
					},
					Input: {
						borderRadius: 4,
						activeShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
					},
					Card: {
						bodyPadding: 36,
						borderRadiusLG: 8,
					},
					Typography: {
						titleMarginBottom: 0,
					},
					Form: {
						itemMarginBottom: 20,
					},
					Table: {
						cellPaddingBlock: 8,
						cellPaddingInline: 8,
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
