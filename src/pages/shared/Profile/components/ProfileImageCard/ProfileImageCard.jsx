import { useState } from 'react'
import { Card, Upload, message, Modal, Flex, Typography } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import ImgCrop from 'antd-img-crop'
import useAPI from '../../../../../hooks/useAPI'
import { useParams } from 'react-router'

const beforeUpload = file => {
	const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
	if (!isJpgOrPng) {
		message.error('فقط فرمت JPG/PNG قابل قبول است!')
	}
	const isLt2M = file.size / 1024 / 1024 < 2
	if (!isLt2M) {
		message.error('حجم فایل باید کمتر از ۲ مگابایت باشد!')
	}
	return isJpgOrPng && isLt2M
}

const ProfileImageCard = ({ initialSrc }) => {
	const { userId } = useParams()
	const [fileList, setFileList] = useState(initialSrc ? [{ uid: '-1', name: 'avatar', status: 'done', url: initialSrc }] : [])
	const { Title } = Typography
	const [previewVisible, setPreviewVisible] = useState(false)
	const [previewImage, setPreviewImage] = useState('')
	const uploadApi = useAPI()

	const handleChange = ({ fileList: newList }) => {
		setFileList(newList)
	}

	const handlePreview = async file => {
		if (!file.url && !file.preview) {
			file.preview = await new Promise(resolve => {
				const reader = new FileReader()
				reader.readAsDataURL(file.originFileObj)
				reader.onload = () => resolve(reader.result)
			})
		}
		setPreviewImage(file.url || file.preview)
		setPreviewVisible(true)
	}

	const handleRemove = async () => {
		try {
			const endpoint = userId ? `upload/profile/picture/${userId}` : 'upload/profile/picture'

			await uploadApi.delete(endpoint)

			setFileList([])
			message.success('عکس با موفقیت حذف شد')
			return true
		} catch (err) {
			console.error('خطا در حذف عکس:', err)
			message.error('حذف عکس با خطا مواجه شد')
			return false
		}
	}

	const customUpload = async ({ file, onSuccess, onError }) => {
		const formData = new FormData()
		formData.append('profilePicture', file)

		try {
			const endpoint = userId ? `upload/profile/picture/${userId}` : 'upload/profile/picture'

			const res = await uploadApi.post(endpoint, formData)

			if (res?.error) {
				throw new Error(res.message || 'آپلود عکس با خطا مواجه شد')
			}

			onSuccess?.(res, file)
			message.success('عکس با موفقیت آپلود شد')
		} catch (err) {
			console.error('خطا در آپلود عکس:', err)
			message.error(err.message || 'آپلود عکس با خطا مواجه شد')
			onError?.(err)
		}
	}

	return (
		<>
			<Card>
				<Flex vertical justify='space-between' gap={10}>
					<Title level={2} className='text-h2'>
						عکس پروفایل
					</Title>
					<ImgCrop rotationSlider>
						<Upload
							accept='.jpg,.png'
							name='profilePicture'
							listType='picture-circle'
							fileList={fileList}
							beforeUpload={beforeUpload}
							customRequest={customUpload}
							onChange={handleChange}
							onPreview={handlePreview}
							onRemove={handleRemove}
							maxCount={1}
							showUploadList={{
								showPreviewIcon: true,
								showRemoveIcon: true,
								removeIcon: <DeleteOutlined />,
							}}
						>
							{fileList.length === 0 && (
								<div>
									<PlusOutlined />
									<div style={{ marginTop: 8 }}>آپلود</div>
								</div>
							)}
						</Upload>
					</ImgCrop>
				</Flex>
			</Card>

			<Modal open={previewVisible} title='پیش‌نمایش تصویر' destroyOnHidden footer={null} onCancel={() => setPreviewVisible(false)}>
				<img alt='preview' style={{ width: '100%' }} src={previewImage} />
			</Modal>
		</>
	)
}

export default ProfileImageCard
