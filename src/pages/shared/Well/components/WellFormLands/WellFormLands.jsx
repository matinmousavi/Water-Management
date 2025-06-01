import { Col, Flex, Form } from 'antd'
import SelectLands from '../SelectLands/SelectLands'

const WellFormLands = ({ form, wellData }) => {
	return (
		<Form form={form} layout='vertical' size='large'>
			<Flex align='center' justify='center'>
				<Col span={16}>
					<Form.Item name='lands' label='زمین ها'>
						<SelectLands defalutValues={wellData?.lands?.map(item => item.name) || []} />
					</Form.Item>
				</Col>
			</Flex>
		</Form>
	)
}
export default WellFormLands
