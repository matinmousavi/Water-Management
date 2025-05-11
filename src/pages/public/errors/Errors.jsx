import { Link } from 'react-router-dom'
import { Result, Button, Flex } from 'antd'

const getErrorMessage = status => {
	switch (status) {
		case '404':
			return 'Page not found!'
		case '403':
			return 'Unauthorized access!'
		case '500':
		default:
			return 'Server error!'
	}
}

const Errors = ({ message, status, to, buttonText = 'Try Again', onClick }) => {
	const errorMessage = message ? message : getErrorMessage(status)

	return (
		<>
			<Flex gap='middle' justify='center' align='center'>
				<Result
					status={status || '500'}
					title={status}
					subTitle={errorMessage}
					extra={
						(to || onClick) && (
							<Link to={to} onClick={onClick}>
								<Button type='primary'>{buttonText}</Button>
							</Link>
						)
					}
				/>
			</Flex>
		</>
	)
}

export default Errors
