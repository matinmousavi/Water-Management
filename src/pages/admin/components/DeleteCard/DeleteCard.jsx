import { Button, Card, Flex, message, App, Typography } from 'antd'
import style from './DeleteCard.module.css'
import { useParams } from 'react-router'
import useAPI from '../../../../hooks/useAPI'
const { Title } = Typography

const DeleteCard = ({ title, api }) => {
    const { id } = useParams()
    const { modal } = App.useApp()
    const { delete: deleteAPI, isLoading } = useAPI()

    const handleDelete = () => {
        modal.confirm({
            title: `حذف ${title}`,
            content: `آیا از حذف این ${title} مطمئن هستید؟ این عمل غیرقابل بازگشت است.`,
            okText: 'بله، حذف شود',
            cancelText: 'انصراف',
            okType: 'danger',
            centered: true,
            onOk: async () => {
                try {
                    await deleteAPI(`${api}/${id}`)
                    message.success(`${title} با موفقیت حذف شد`)
                } catch (error) {
                    message.error(`خطا در حذف ${title}`)
                    console.error('Error deleting user:', error)
                }
            },
            okButtonProps: {
                loading: isLoading,
            },
        })
    }

    return (
        <Card className={style.card}>
            <Flex justify='space-between' align='center'>
                <Title level={2} className='text-h2'>
                    حذف زمین
                </Title>
                <Button className={style.button} type='primary' danger onClick={handleDelete} loading={isLoading}>
                    حذف {title}
                </Button>
            </Flex>
        </Card>
    )
}

export default DeleteCard