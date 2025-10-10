import { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input } from 'antd'

import BottomSheetModal from '../BottomSheetModal/BottomSheetModal'
import MobileNotesList from './components/MobileNotesList/MobileNotesList'

import styles from './MobileNotesPanel.module.css'

const MobileNotesPanel = ({
        notes = [],
        isLoading = false,
        onAddNote,
        onUpdateNote,
        onNotesChange,
        addButtonLabel = 'افزودن یادداشت',
        addTitle = 'افزودن یادداشت',
        editTitle = 'ویرایش یادداشت',
}) => {
        const [form] = Form.useForm()
        const [isOpen, setIsOpen] = useState(false)
        const [editingNote, setEditingNote] = useState(null)
        const [localNotes, setLocalNotes] = useState(() => [...notes])
        const [submitting, setSubmitting] = useState(false)

        useEffect(() => {
                setLocalNotes(notes)
        }, [notes])

        useEffect(() => {
                if (!isOpen) {
                        form.resetFields()
                        return
                }

                if (editingNote) {
                        form.setFieldsValue({ text: editingNote?.text ?? '' })
                } else {
                        form.resetFields()
                }
        }, [isOpen, editingNote, form])

        const handleAddClick = () => {
                setEditingNote(null)
                setIsOpen(true)
        }

        const handleEditNote = note => {
                setEditingNote(note)
                setIsOpen(true)
        }

        const closeModal = () => {
                setIsOpen(false)
                setEditingNote(null)
                form.resetFields()
        }

        const propagateNotes = updater => {
                setLocalNotes(prev => {
                        const next = typeof updater === 'function' ? updater(prev) : updater
                        onNotesChange?.(next)
                        return next
                })
        }

        const handleSubmit = async values => {
                const payload = { text: values?.text?.trim() ?? '' }
                if (!payload.text) return

                try {
                        setSubmitting(true)
                        if (editingNote) {
                                const updated = await onUpdateNote?.(editingNote, payload)
                                if (updated) {
                                        propagateNotes(prev =>
                                                prev.map(note => (note?._id || note?.id) === (updated?._id || updated?.id) ? updated : note),
                                        )
                                }
                        } else {
                                const created = await onAddNote?.(payload)
                                if (created) {
                                        propagateNotes(prev => [...prev, created])
                                }
                        }
                        closeModal()
                } catch (error) {
                        console.error('Failed to submit note:', error)
                } finally {
                        setSubmitting(false)
                }
        }

        const notesList = useMemo(() => localNotes ?? [], [localNotes])

        return (
                <section className={styles.section}>
                        <div className={styles.addButtonBar}>
                                <Button type='default' className='button-modal' onClick={handleAddClick}>
                                        {addButtonLabel}
                                </Button>
                        </div>

                        <div className={styles.listWrapper}>
                                <MobileNotesList notes={notesList} onEditNote={handleEditNote} />
                        </div>

                        <BottomSheetModal
                                form={form}
                                height={322}
                                open={isOpen}
                                onClose={closeModal}
                                onSubmit={handleSubmit}
                                loading={isLoading || submitting}
                                title={editingNote ? editTitle : addTitle}
                        >
                                <div className={styles.modalContainer}>
                                        <Form.Item name='text' rules={[{ required: true, message: 'لطفاً متن یادداشت را وارد کنید' }]}> 
                                                <Input.TextArea className={styles.textArea} rows={6} />
                                        </Form.Item>
                                </div>
                        </BottomSheetModal>
                </section>
        )
}

export default MobileNotesPanel
