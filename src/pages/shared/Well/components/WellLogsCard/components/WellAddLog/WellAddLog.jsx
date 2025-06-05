import { Button, Flex } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import useModal from '../../../../../../../hooks/useModal'
import IrrigationModal from '../../../../../../../components/IrrigationModal/IrrigationModal'
import WellLogForm from '../WellLogForm/WellLogForm'
import { useState } from 'react'
import useAPI from '../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../hooks/useNotification'

const WellAddLog = ({ wellId, setLogs }) => {
  const { isOpen, open, close } = useModal()
  const [loading, setLoading] = useState(false)
  const api = useAPI()
  const { openNotification } = useNotification()

  const handleSubmit = async (formData) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/irrigations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, wellId }),
      })
      const newLog = await response.json()
      if (!response.ok) throw new Error(newLog.message || 'خطا در افزودن لاگ')
      const updatedData = await api.get(`wells/${wellId}`)
      if (updatedData?.well?.logs) {
        setLogs(updatedData.well.logs)
      }
      openNotification('success', 'لاگ با موفقیت اضافه شد')
      close()
    } catch (error) {
      console.error('Error in WellAddLog:', error)
      openNotification('error', error.message || 'خطا در افزودن لاگ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button type='default' size='middle' onClick={open}>
        <Flex gap={8}>
          <PlusCircleOutlined />
          <span>افزودن لاگ</span>
        </Flex>
      </Button>
      <IrrigationModal type='add' wellId={wellId} isOpen={isOpen} setIsOpen={close} loading={loading}>
        <WellLogForm onFinish={handleSubmit} />
      </IrrigationModal>
    </>
  )
}

export default WellAddLog