import { Flex, Typography, Tag } from 'antd'
import { EditOutlined } from '@ant-design/icons'

import useAPI from '../../../hooks/useAPI'
import { useParams } from 'react-router'
import { useEffect, useState } from 'react'
import Loading from '../../../components/Loading/Loading'
import useNotification from '../../../hooks/useNotification'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import DeleteCard from '../../../components/DeleteCard/DeleteCard'
import BackButton from '../../../components/BackButton/BackButton'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import LandInfo from './components/LandInfo/LandInfo'
import { useUser } from '../../../contexts/UserContext'
import LandNote from './components/LandNote/LandNote'

const { Title } = Typography

const Land = () => {
	const [landData, setLandData] = useState(null)
	const { landId } = useParams()
	const { openNotification } = useNotification()
	const { isAdmin } = useUser()
	const landApi = useAPI()
	const [pageTitle, setPageTitle] = useState('')

	const fetchLand = async () => {
		try {
			const response = await landApi.get(`lands/${landId}`)
			if (response?.land) {
				setLandData(response.land)
				setPageTitle(response.land.name)
			}
		} catch (error) {
			openNotification('error', 'خطا در دریافت اطلاعات زمین')
			console.error('خطا در دریافت اطلاعات زمین:', error)
		}
	}

	useEffect(() => {
		if (landId) {
			fetchLand()
		}
	}, [landId])

	if (landApi.isLoading || !landData) return <Loading />

	return (
		<>
			<MetaTitle>{pageTitle || 'ویرایش زمین'}</MetaTitle>

			<Flex vertical gap={16}>
				<Breadcrumbs data={{ title: pageTitle }} />
				<Flex align='center'>
					<BackButton backTo={'wells'} />
					<Title level={1} className='text-h3'>
						{pageTitle}
					</Title>
					<Tag color='green'>
						<Flex align='center' gap={3}>
							فعال <EditOutlined />
						</Flex>
					</Tag>
				</Flex>

				<LandInfo landData={landData} setPageTitle={setPageTitle} />
				<LandNote notesData={landData.notes} api={landApi} mainData={landData} setMainData={setLandData} />

				{isAdmin && <DeleteCard title='زمین' api={`lands/${landId}`} backTo='/lands' />}
			</Flex>
		</>
	)
}

export default Land
