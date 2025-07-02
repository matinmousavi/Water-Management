import React, { useState } from 'react'
import { Upload, message, Modal, Flex } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import ImgCrop from 'antd-img-crop'
import useAPI from '../../../hooks/useAPI'
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

const ProfileImageInput = ({ pictureUrl, form }) => {
	const [fileList, setFileList] = useState(
		pictureUrl ? [{ uid: '-1', name: 'avatar', status: 'done', url: pictureUrl }] : []
	)
	const [previewVisible, setPreviewVisible] = useState(false)
	const [previewImage, setPreviewImage] = useState('')

	const uploadApi = useAPI()
	const { userId } = useParams()

	const handleChange = ({ fileList: newList }) => {
		const updatedList = newList.map(file => {
			if (file.status === 'error') {
				return {
					...file,
					thumbUrl: '/default-profile.png',
				}
			}
			return file
		})

		setFileList(updatedList)

		if (form) {
			form.setFieldsValue({
				image: updatedList.length > 0 ? updatedList[0] : null,
			})
		}
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
			if (res?.error) throw new Error(res.message || 'آپلود عکس با خطا مواجه شد')
			onSuccess?.(res, file)
			message.success('عکس با موفقیت آپلود شد')
		} catch (err) {
			message.error(err.message || 'آپلود عکس با خطا مواجه شد')
			onError?.(err)
		}
	}

	return (
		<>
			<ImgCrop rotationSlider>
				<Upload
					accept=".jpg,.png"
					name="profilePicture"
					fileList={fileList}
					beforeUpload={beforeUpload}
					customRequest={customUpload}
					onChange={handleChange}
					onPreview={handlePreview}
					onRemove={handleRemove}
					maxCount={1}
					listType="picture"
					showUploadList={{
						showPreviewIcon: true,
						showRemoveIcon: true,
						removeIcon: <DeleteOutlined />,
					}}
				>
					{fileList.length === 0 && (
						<Flex
							gap={8}
							align="center"
							justify="center"
							style={{
								border: '1px dashed #3B8FF3',
								borderRadius: 4,
								width: '100%',
								height: 40,
								color: '#3B8FF3',
								cursor: 'pointer',
							}}
						>
							<PlusOutlined />
							<div>انتخاب عکس پروفایل</div>
						</Flex>
					)}
				</Upload>
			</ImgCrop>

			<Modal
				open={previewVisible}
				title="پیش‌نمایش تصویر"
				destroyOnClose
				footer={null}
				onCancel={() => setPreviewVisible(false)}
			>
				<img alt="preview" style={{ width: '100%' }} src={previewImage} />
			</Modal>
		</>
	)
}

export default React.memo(ProfileImageInput)
