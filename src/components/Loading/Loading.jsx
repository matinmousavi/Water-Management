import { Flex, Spin } from 'antd'

const Loading = () => {
    return (
        <Flex justify="center" align="center" style={{ height: '100vh' }}>
            <Spin size="large" />
        </Flex>
    )
}

export default Loading