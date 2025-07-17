import { Flex, Typography } from 'antd'

const SettingsSection = ({ title, children, className }) => {
	return (
		<Flex vertical gap={16} className={className}>
			<Typography.Title level={2} className="text-page-title">
				{title}
			</Typography.Title>
			{children}
		</Flex>
	)
}

export default SettingsSection
