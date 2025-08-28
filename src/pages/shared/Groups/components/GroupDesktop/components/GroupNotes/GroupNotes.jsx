import Notes from '../../../../../../../components/Notes/Notes'

const GroupNotes = ({ groupId, notes }) => {
	return <Notes entityType='landGroup' entityReference={groupId} notesData={notes} />
}

export default GroupNotes
