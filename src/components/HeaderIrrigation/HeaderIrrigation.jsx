import { Flex, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import styles from './HeaderIrrigation.module.css'
import { ArrowRightOutlined, CaretDownOutlined, CaretUpOutlined, EyeOutlined } from '@ant-design/icons'
import { useState } from 'react'
import WellsList from '../../pages/shared/Well/components/WellMobileView/components/WellsList/WellsList'

const HeaderIrrigation = ({ title, icon, isSelect = false, selectTitle, selectData, setSelect }) => {
	const { Title } = Typography
	const navigate = useNavigate()
	const [open, setOpen] = useState(false)
	return (
		<Flex align='center' className={styles.containerHeader} justify='center'>
			<button onClick={() => navigate(-1)} className={styles.backLink}>
				<ArrowRightOutlined className={styles.icon} size={24} />
			</button>

			<Flex gap={8}>
				<img src={icon} alt='icon image' />
				<Title className='title-h1'>
					{title} {selectTitle && ` چاه ${selectTitle}`}
				</Title>

				{isSelect ? (
					selectData?.length <= 1 ? null : open ? (
						<CaretUpOutlined onClick={() => setOpen(true)} style={{ color: '#00000073' }} />
					) : (
						<CaretDownOutlined onClick={() => setOpen(true)} style={{ color: '#00000073' }} />
					)
				) : null}
				<WellsList
					open={open}
					onClose={() => setOpen(false)}
					data={selectData}
					setData={well => {
						setSelect(well)
						setOpen(false)
					}}
				/>
			</Flex>
		</Flex>
	)
}

export default HeaderIrrigation
